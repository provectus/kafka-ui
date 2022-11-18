package com.provectus.kafka.ui.service.reassign;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.PartitionReassignmentDTO;
import com.provectus.kafka.ui.model.ReassignPartitionsCommandDTO;
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
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@RequiredArgsConstructor
public class ReassignmentPlanner {

  record BrokerMetadata(int id, Optional<String> rack) {
  }

  private final ReactiveAdminClient adminClient;

  public Mono<ReassignPartitionsCommandDTO> generatePartitionReassignment(Set<String> topics,
                                                                          List<Integer> brokerIds,
                                                                          boolean rackAware) {
    return Mono.zip(currentAssignments(adminClient, topics), brokerMetadata(brokerIds)).map(t ->
        createSuggestedReassignment(
            calculateAssignment(t.getT1(), t.getT2(), rackAware)));
  }

  private static ReassignPartitionsCommandDTO createSuggestedReassignment(
      Map<TopicPartition, List<Integer>> assignment) {
    var dto = new ReassignPartitionsCommandDTO().version(1);
    assignment.forEach((tp, replicas) ->
        dto.addPartitionsItem(
            new PartitionReassignmentDTO()
                .topic(tp.topic())
                .partition(tp.partition())
                .replicas(replicas)
                .logDirs(replicas.stream().map(r -> "any").toList())));
    return dto;
  }

  // [ topic -> [tp -> list of replicas] ]
  public static Mono<Map<String, Map<TopicPartition, List<Integer>>>> currentAssignments(ReactiveAdminClient ac, Set<String> topics) {
    return ac.describeTopics(topics)
        .map(topicToDescriptionMap ->
            topicToDescriptionMap.entrySet().stream()
                .map(e ->
                    Tuples.of(
                        e.getKey(),
                        e.getValue().partitions().stream()
                            .map(p ->
                                Tuples.of(
                                    new TopicPartition(e.getKey(), p.partition()),
                                    p.replicas().stream().map(Node::id).toList()
                                )).collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2))
                    ))
                .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2))
        );
  }

  private Mono<List<BrokerMetadata>> brokerMetadata(List<Integer> brokerIds) {
    return adminClient.describeCluster()
        .map(description -> description.getNodes().stream()
            .filter(n -> brokerIds.contains(n.id()))
            .map(n -> new BrokerMetadata(n.id(), Optional.ofNullable(n.rack())))
            .toList());
  }

  @VisibleForTesting
  static Map<TopicPartition, List<Integer>> calculateAssignment(
      Map<String, Map<TopicPartition, List<Integer>>> currentAssignments,
      List<BrokerMetadata> brokerMetadata,
      boolean rackAware) {
    if (rackAware && brokerMetadata.stream().anyMatch(m -> m.rack().isEmpty())) {
      throw new ValidationException("Not all brokers have rack information for replica rack aware assignment");
    }
    return rackAware
        ? calculateAssignmentRackAware(currentAssignments, brokerMetadata)
        : calculateAssignmentRackUnaware(currentAssignments, brokerMetadata);
  }

  private static Map<TopicPartition, List<Integer>> calculateAssignmentRackAware(
      Map<String, Map<TopicPartition, List<Integer>>> currentAssignments,
      List<BrokerMetadata> brokerMetadata) {
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
              brokerMetadata.stream().map(BrokerMetadata::id).collect(Collectors.toList()),
              ThreadLocalRandom.current()
          )
      );
    });
    return result;
  }

  static Map<TopicPartition, List<Integer>> assignReplicasToBrokersRackUnaware(
      String topic,
      int nPartitions,
      int replicationFactor,
      List<Integer> brokerList,
      RandomGenerator rand) {
    var result = new LinkedHashMap<TopicPartition, List<Integer>>();
    int startIndex = rand.nextInt(brokerList.size());
    int currentPartitionId = 0;
    int nextReplicaShift = rand.nextInt(brokerList.size());
    for (int i = 0; i < nPartitions; i++) {
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

  private static int replicaIndex(int firstReplicaIndex, int secondReplicaShift, int replicaIndex, int nBrokers) {
    var shift = 1 + (secondReplicaShift + replicaIndex) % (nBrokers - 1);
    return (firstReplicaIndex + shift) % nBrokers;
  }

}
