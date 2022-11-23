package com.provectus.kafka.ui.service.reassign;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.random.RandomGenerator;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.PartitionReassignment;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@RequiredArgsConstructor
class ReassignmentOperations {

  public static final int SUPPORTED_CMD_VERSION = 1;
  public static final String LOG_DIR_NOT_SET_STRING = "any";

  private record BrokerMetadata(int id, Optional<String> rack) {}

  private final ReactiveAdminClient adminClient;

  Mono<Map<TopicPartition, List<Integer>>> generatePartitionReassignment(Set<String> topics,
                                                                         List<Integer> brokerIds,
                                                                         boolean rackAware) {
    return Mono.zip(getCurrentAssignment(topics), getBrokersMetadata(brokerIds))
        .map(t -> calculateAssignment(t.getT1(), t.getT2(), rackAware));
  }

  // [ topic -> [partition -> list of replica ids] ]
  Mono<Map<TopicPartition, List<Integer>>> getCurrentAssignment(Set<String> topics) {
    return adminClient.describeTopics(topics)
        .map(topicToDescriptionMap -> topicToDescriptionMap.entrySet().stream()
            .flatMap((Map.Entry<String, TopicDescription> e) ->
                e.getValue().partitions().stream()
                    .map(p ->
                        Tuples.of(
                            new TopicPartition(e.getKey(), p.partition()),
                            p.replicas().stream().map(Node::id).toList())))
            .collect(toMap(Tuple2::getT1, Tuple2::getT2)));
  }

  Mono<Void> validateAndExecute(List<Tuple2<TopicPartition, List<Integer>>> reassignment, Runnable preExecute) {
    return validateCmd(reassignment)
        .doOnNext(r -> preExecute.run())
        .flatMap(adminClient::alterPartitionReassignments);
  }

  private Mono<Map<TopicPartition, Optional<NewPartitionReassignment>>> validateCmd(
      List<Tuple2<TopicPartition, List<Integer>>> reassignment) {
    if (reassignment.isEmpty()) {
      throw new ValidationException("Partition reassignment list cannot be empty");
    }
    if (reassignment.stream().map(Tuple2::getT2).anyMatch(List::isEmpty)) {
      throw new ValidationException("Partition replica list cannot be empty");
    }
    if (reassignment.stream().map(Tuple2::getT1).distinct().count() < reassignment.size()) {
      throw new ValidationException("Partition reassignment contains duplicate topic partitions");
    }
    return adminClient.describeCluster()
        .doOnNext(description -> {
          var knownIds = description.getNodes().stream().map(Node::id).toList();
          var unknownIds = reassignment.stream()
              .flatMap(t -> t.getT2().stream())
              .filter(id -> !knownIds.contains(id))
              .toList();
          if (!unknownIds.isEmpty()) {
            throw new ValidationException("Unknown broker ids: " + unknownIds);
          }
        })
        .thenReturn(reassignment.stream()
            .collect(toMap(Tuple2::getT1, t -> Optional.of(new NewPartitionReassignment(t.getT2())))));
  }

  private Mono<List<BrokerMetadata>> getBrokersMetadata(List<Integer> brokerIds) {
    return adminClient.describeCluster()
        .map(description -> description.getNodes().stream()
            .filter(n -> brokerIds.contains(n.id()))
            .map(n -> new BrokerMetadata(n.id(), Optional.ofNullable(n.rack())))
            .toList());
  }

  private static Map<TopicPartition, List<Integer>> calculateAssignment(
      Map<TopicPartition, List<Integer>> currentAssignments,
      List<BrokerMetadata> brokerMetadata,
      boolean rackAware) {
    Map<String, Map<TopicPartition, List<Integer>>> perTopic = currentAssignments.entrySet().stream()
        .collect(groupingBy(e -> e.getKey().topic(), toMap(Map.Entry::getKey, Map.Entry::getValue)));
    return rackAware
        ? calculateAssignmentRackAware(perTopic, brokerMetadata)
        : calculateAssignmentRackUnaware(perTopic, brokerMetadata);
  }

  private static Map<TopicPartition, List<Integer>> calculateAssignmentRackAware(
      Map<String, Map<TopicPartition, List<Integer>>> currentAssignments,
      List<BrokerMetadata> brokerMetadata) {
    if (brokerMetadata.stream().anyMatch(m -> m.rack().isEmpty())) {
      throw new ValidationException("Not all brokers have rack information for replica rack aware assignment");
    }
    log.warn("Rack-aware assignment calculation is not implemented yet, falling back to usual calculation");
    return calculateAssignmentRackUnaware(currentAssignments, brokerMetadata);
  }

  private static Map<TopicPartition, List<Integer>> calculateAssignmentRackUnaware(
      Map<String, Map<TopicPartition, List<Integer>>> currentAssignments,
      List<BrokerMetadata> brokerMetadata) {
    Map<TopicPartition, List<Integer>> result = new LinkedHashMap<>();
    currentAssignments.forEach((topic, currentAssignment) -> {
      result.putAll(
          assignReplicasToBrokersRackUnaware(
              topic,
              currentAssignment.size(),
              currentAssignment.entrySet().iterator().next().getValue().size(),
              brokerMetadata.stream().map(BrokerMetadata::id).collect(toList()),
              ThreadLocalRandom.current()
          )
      );
    });
    return result;
  }

  // implementation copied from https://github.com/apache/kafka/blob/1874f2388cffa7a1e866cbe4aff8b92c9d953b41/core/src/main/scala/kafka/admin/AdminUtils.scala#L125
  @VisibleForTesting
  static Map<TopicPartition, List<Integer>> assignReplicasToBrokersRackUnaware(
      String topic,
      int numPartitions,
      int replicationFactor,
      List<Integer> brokerList,
      RandomGenerator rand) {
    var result = new LinkedHashMap<TopicPartition, List<Integer>>();
    int startIndex = rand.nextInt(brokerList.size());
    int currentPartitionId = 0;
    int nextReplicaShift = startIndex;
    for (int i = 0; i < numPartitions; i++) {
      if (currentPartitionId > 0 && (currentPartitionId % brokerList.size() == 0)) {
        nextReplicaShift += 1;
      }
      int firstReplicaIndex = (currentPartitionId + startIndex) % brokerList.size();
      var replicaBuffer = Lists.newArrayList(brokerList.get(firstReplicaIndex));
      for (int j = 0; j < replicationFactor - 1; j++) {
        replicaBuffer.add(brokerList.get(replicaIndex(firstReplicaIndex, nextReplicaShift, j, brokerList.size())));
      }
      result.put(new TopicPartition(topic, currentPartitionId), replicaBuffer);
      currentPartitionId += 1;
    }
    return result;
  }

  private static int replicaIndex(int firstReplicaIndex, int secondReplicaShift, int replicaIndex, int numBrokers) {
    var shift = 1 + (secondReplicaShift + replicaIndex) % (numBrokers - 1);
    return (firstReplicaIndex + shift) % numBrokers;
  }

  Mono<Void> cancelReassignment(Set<TopicPartition> partitions) {
    return adminClient.listPartitionReassignments()
        .map(reassignments -> reassignments.entrySet().stream()
            .filter(e -> partitions.contains(e.getKey()))
            .filter(e -> {
              PartitionReassignment reassignment = e.getValue();
              return !reassignment.addingReplicas().isEmpty()
                  || !reassignment.removingReplicas().isEmpty();
            })
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet()))
        .flatMap(tps -> tps.isEmpty()
            ? Mono.empty()
            : adminClient.alterPartitionReassignments(tps.stream().collect(toMap(p -> p, p -> Optional.empty()))));
  }

}
