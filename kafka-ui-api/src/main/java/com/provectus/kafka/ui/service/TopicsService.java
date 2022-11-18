package com.provectus.kafka.ui.service;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.exception.TopicMetadataException;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.TopicRecreationException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalPartitionsOffsets;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.PartitionsIncreaseDTO;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponseDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponseDTO;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.TopicExistsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
@RequiredArgsConstructor
public class TopicsService {

  private final AdminClientService adminClientService;
  private final DeserializationService deserializationService;
  private final StatisticsCache statisticsCache;
  @Value("${topic.recreate.maxRetries:15}")
  private int recreateMaxRetries;
  @Value("${topic.recreate.delay.seconds:1}")
  private int recreateDelayInSeconds;
  @Value("${topic.load.after.create.maxRetries:10}")
  private int loadTopicAfterCreateRetries;
  @Value("${topic.load.after.create.delay.ms:500}")
  private int loadTopicAfterCreateDelayInMs;

  public Mono<List<InternalTopic>> loadTopics(KafkaCluster c, List<String> topics) {
    if (topics.isEmpty()) {
      return Mono.just(List.of());
    }
    return adminClientService.get(c)
        .flatMap(ac ->
            ac.describeTopics(topics).zipWith(ac.getTopicsConfig(topics, false),
                (descriptions, configs) -> {
                  statisticsCache.update(c, descriptions, configs);
                  return getPartitionOffsets(descriptions, ac).map(offsets -> {
                    var metrics = statisticsCache.get(c);
                    return createList(
                        topics,
                        descriptions,
                        configs,
                        offsets,
                        metrics.getMetrics(),
                        metrics.getLogDirInfo()
                    );
                  });
                })).flatMap(Function.identity());
  }

  private Mono<InternalTopic> loadTopic(KafkaCluster c, String topicName) {
    return loadTopics(c, List.of(topicName))
        .flatMap(lst -> lst.stream().findFirst()
            .map(Mono::just)
            .orElse(Mono.error(TopicNotFoundException::new)));
  }

  /**
   *  After creation topic can be invisible via API for some time.
   *  To workaround this, we retyring topic loading until it becomes visible.
   */
  private Mono<InternalTopic> loadTopicAfterCreation(KafkaCluster c, String topicName) {
    return loadTopic(c, topicName)
        .retryWhen(
            Retry
                .fixedDelay(
                    loadTopicAfterCreateRetries,
                    Duration.ofMillis(loadTopicAfterCreateDelayInMs)
                )
                .filter(TopicNotFoundException.class::isInstance)
                .onRetryExhaustedThrow((spec, sig) ->
                    new TopicMetadataException(
                        String.format(
                            "Error while loading created topic '%s' - topic is not visible via API "
                                + "after waiting for %d ms.",
                            topicName,
                            loadTopicAfterCreateDelayInMs * loadTopicAfterCreateRetries)))
        );
  }

  private List<InternalTopic> createList(List<String> orderedNames,
                                         Map<String, TopicDescription> descriptions,
                                         Map<String, List<ConfigEntry>> configs,
                                         InternalPartitionsOffsets partitionsOffsets,
                                         Metrics metrics,
                                         InternalLogDirStats logDirInfo) {
    return orderedNames.stream()
        .filter(descriptions::containsKey)
        .map(t -> InternalTopic.from(
            descriptions.get(t),
            configs.getOrDefault(t, List.of()),
            partitionsOffsets,
            metrics,
            logDirInfo
        ))
        .collect(toList());
  }

  private Mono<InternalPartitionsOffsets> getPartitionOffsets(Map<String, TopicDescription>
                                                                  descriptions,
                                                              ReactiveAdminClient ac) {
    var topicPartitions = descriptions.values().stream()
        .flatMap(desc ->
            desc.partitions().stream()
                // list offsets should only be applied to partitions with existing leader
                // (see ReactiveAdminClient.listOffsetsUnsafe(..) docs)
                .filter(tp -> tp.leader() != null)
                .map(p -> new TopicPartition(desc.name(), p.partition())))
        .collect(toList());

    return ac.listOffsetsUnsafe(topicPartitions, OffsetSpec.earliest())
        .zipWith(ac.listOffsetsUnsafe(topicPartitions, OffsetSpec.latest()),
            (earliest, latest) ->
                topicPartitions.stream()
                    .filter(tp -> earliest.containsKey(tp) && latest.containsKey(tp))
                    .map(tp ->
                        Map.entry(tp,
                            new InternalPartitionsOffsets.Offsets(
                                earliest.get(tp), latest.get(tp))))
                    .collect(toMap(Map.Entry::getKey, Map.Entry::getValue)))
        .map(InternalPartitionsOffsets::new);
  }

  public Mono<InternalTopic> getTopicDetails(KafkaCluster cluster, String topicName) {
    return loadTopic(cluster, topicName);
  }

  public Mono<List<ConfigEntry>> getTopicConfigs(KafkaCluster cluster, String topicName) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.getTopicsConfig(List.of(topicName), true))
        .map(m -> m.values().stream().findFirst().orElseThrow(TopicNotFoundException::new));
  }

  private Mono<InternalTopic> createTopic(KafkaCluster c, ReactiveAdminClient adminClient,
                                          Mono<TopicCreationDTO> topicCreation) {
    return topicCreation.flatMap(topicData ->
            adminClient.createTopic(
                topicData.getName(),
                topicData.getPartitions(),
                topicData.getReplicationFactor(),
                topicData.getConfigs()
            ).thenReturn(topicData)
        )
        .onErrorMap(t -> new TopicMetadataException(t.getMessage(), t))
        .flatMap(topicData -> loadTopicAfterCreation(c, topicData.getName()));
  }

  public Mono<InternalTopic> createTopic(KafkaCluster cluster, Mono<TopicCreationDTO> topicCreation) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createTopic(cluster, ac, topicCreation));
  }

  public Mono<InternalTopic> recreateTopic(KafkaCluster cluster, String topicName) {
    return loadTopic(cluster, topicName)
        .flatMap(t -> deleteTopic(cluster, topicName)
            .thenReturn(t)
            .delayElement(Duration.ofSeconds(recreateDelayInSeconds))
            .flatMap(topic ->
                adminClientService.get(cluster)
                    .flatMap(ac ->
                        ac.createTopic(
                                topic.getName(),
                                topic.getPartitionCount(),
                                topic.getReplicationFactor(),
                                topic.getTopicConfigs()
                                    .stream()
                                    .collect(Collectors.toMap(InternalTopicConfig::getName,
                                        InternalTopicConfig::getValue))
                            )
                            .thenReturn(topicName)
                    )
                    .retryWhen(
                        Retry.fixedDelay(recreateMaxRetries, Duration.ofSeconds(recreateDelayInSeconds))
                            .filter(TopicExistsException.class::isInstance)
                            .onRetryExhaustedThrow((a, b) ->
                                new TopicRecreationException(topicName,
                                    recreateMaxRetries * recreateDelayInSeconds))
                    )
                    .flatMap(a -> loadTopicAfterCreation(cluster, topicName))
            )
        );
  }

  private Mono<InternalTopic> updateTopic(KafkaCluster cluster,
                                          String topicName,
                                          TopicUpdateDTO topicUpdate) {
    return adminClientService.get(cluster)
        .flatMap(ac ->
            ac.updateTopicConfig(topicName, topicUpdate.getConfigs())
                .then(loadTopic(cluster, topicName)));
  }

  public Mono<InternalTopic> updateTopic(KafkaCluster cl, String topicName,
                                    Mono<TopicUpdateDTO> topicUpdate) {
    return topicUpdate
        .flatMap(t -> updateTopic(cl, topicName, t));
  }

  private Mono<InternalTopic> changeReplicationFactor(
      KafkaCluster cluster,
      ReactiveAdminClient adminClient,
      String topicName,
      Map<TopicPartition, Optional<NewPartitionReassignment>> reassignments
  ) {
    return adminClient.alterPartitionReassignments(reassignments)
        .then(loadTopic(cluster, topicName));
  }

  /**
   * Change topic replication factor, works on brokers versions 5.4.x and higher
   */
  public Mono<ReplicationFactorChangeResponseDTO> changeReplicationFactor(
      KafkaCluster cluster,
      String topicName,
      ReplicationFactorChangeDTO replicationFactorChange) {
    return loadTopic(cluster, topicName).flatMap(topic -> adminClientService.get(cluster)
        .flatMap(ac -> {
          Integer actual = topic.getReplicationFactor();
          Integer requested = replicationFactorChange.getTotalReplicationFactor();
          Integer brokersCount = statisticsCache.get(cluster).getClusterDescription()
              .getNodes().size();

          if (requested.equals(actual)) {
            return Mono.error(
                new ValidationException(
                    String.format("Topic already has replicationFactor %s.", actual)));
          }
          if (requested <= 0) {
            return Mono.error(
                new ValidationException(
                    String.format("Requested replication factor (%s) should be greater or equal to 1.", requested)));
          }
          if (requested > brokersCount) {
            return Mono.error(
                new ValidationException(
                    String.format("Requested replication factor %s more than brokers count %s.",
                        requested, brokersCount)));
          }
          return changeReplicationFactor(cluster, ac, topicName,
              getPartitionsReassignments(cluster, topic,
                  replicationFactorChange));
        })
        .map(t -> new ReplicationFactorChangeResponseDTO()
            .topicName(t.getName())
            .totalReplicationFactor(t.getReplicationFactor())));
  }

  private Map<TopicPartition, Optional<NewPartitionReassignment>> getPartitionsReassignments(
      KafkaCluster cluster,
      InternalTopic topic,
      ReplicationFactorChangeDTO replicationFactorChange) {
    // Current assignment map (Partition number -> List of brokers)
    Map<Integer, List<Integer>> currentAssignment = getCurrentAssignment(topic);
    // Brokers map (Broker id -> count)
    Map<Integer, Integer> brokersUsage = getBrokersMap(cluster, currentAssignment);
    int currentReplicationFactor = topic.getReplicationFactor();

    // If we should to increase Replication factor
    if (replicationFactorChange.getTotalReplicationFactor() > currentReplicationFactor) {
      // For each partition
      for (var assignmentList : currentAssignment.values()) {
        // Get brokers list sorted by usage
        var brokers = brokersUsage.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .collect(toList());

        // Iterate brokers and try to add them in assignment
        // while partition replicas count != requested replication factor
        for (Integer broker : brokers) {
          if (!assignmentList.contains(broker)) {
            assignmentList.add(broker);
            brokersUsage.merge(broker, 1, Integer::sum);
          }
          if (assignmentList.size() == replicationFactorChange.getTotalReplicationFactor()) {
            break;
          }
        }
        if (assignmentList.size() != replicationFactorChange.getTotalReplicationFactor()) {
          throw new ValidationException("Something went wrong during adding replicas");
        }
      }

      // If we should to decrease Replication factor
    } else if (replicationFactorChange.getTotalReplicationFactor() < currentReplicationFactor) {
      for (Map.Entry<Integer, List<Integer>> assignmentEntry : currentAssignment.entrySet()) {
        var partition = assignmentEntry.getKey();
        var brokers = assignmentEntry.getValue();

        // Get brokers list sorted by usage in reverse order
        var brokersUsageList = brokersUsage.entrySet().stream()
            .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
            .map(Map.Entry::getKey)
            .collect(toList());

        // Iterate brokers and try to remove them from assignment
        // while partition replicas count != requested replication factor
        for (Integer broker : brokersUsageList) {
          // Check is the broker the leader of partition
          if (!topic.getPartitions().get(partition).getLeader()
              .equals(broker)) {
            brokers.remove(broker);
            brokersUsage.merge(broker, -1, Integer::sum);
          }
          if (brokers.size() == replicationFactorChange.getTotalReplicationFactor()) {
            break;
          }
        }
        if (brokers.size() != replicationFactorChange.getTotalReplicationFactor()) {
          throw new ValidationException("Something went wrong during removing replicas");
        }
      }
    } else {
      throw new ValidationException("Replication factor already equals requested");
    }

    // Return result map
    return currentAssignment.entrySet().stream().collect(toMap(
        e -> new TopicPartition(topic.getName(), e.getKey()),
        e -> Optional.of(new NewPartitionReassignment(e.getValue()))
    ));
  }

  private Map<Integer, List<Integer>> getCurrentAssignment(InternalTopic topic) {
    return topic.getPartitions().values().stream()
        .collect(toMap(
            InternalPartition::getPartition,
            p -> p.getReplicas().stream()
                .map(InternalReplica::getBroker)
                .collect(toList())
        ));
  }

  private Map<Integer, Integer> getBrokersMap(KafkaCluster cluster,
                                              Map<Integer, List<Integer>> currentAssignment) {
    Map<Integer, Integer> result = statisticsCache.get(cluster).getClusterDescription().getNodes()
        .stream()
        .map(Node::id)
        .collect(toMap(
            c -> c,
            c -> 0
        ));
    currentAssignment.values().forEach(brokers -> brokers
        .forEach(broker -> result.put(broker, result.get(broker) + 1)));

    return result;
  }

  public Mono<PartitionsIncreaseResponseDTO> increaseTopicPartitions(
      KafkaCluster cluster,
      String topicName,
      PartitionsIncreaseDTO partitionsIncrease) {
    return loadTopic(cluster, topicName).flatMap(topic ->
        adminClientService.get(cluster).flatMap(ac -> {
          Integer actualCount = topic.getPartitionCount();
          Integer requestedCount = partitionsIncrease.getTotalPartitionsCount();

          if (requestedCount < actualCount) {
            return Mono.error(
                new ValidationException(String.format(
                    "Topic currently has %s partitions, which is higher than the requested %s.",
                    actualCount, requestedCount)));
          }
          if (requestedCount.equals(actualCount)) {
            return Mono.error(
                new ValidationException(
                    String.format("Topic already has %s partitions.", actualCount)));
          }

          Map<String, NewPartitions> newPartitionsMap = Collections.singletonMap(
              topicName,
              NewPartitions.increaseTo(partitionsIncrease.getTotalPartitionsCount())
          );
          return ac.createPartitions(newPartitionsMap)
              .then(loadTopic(cluster, topicName));
        }).map(t -> new PartitionsIncreaseResponseDTO()
            .topicName(t.getName())
            .totalPartitionsCount(t.getPartitionCount())
        )
    );
  }

  public Mono<Void> deleteTopic(KafkaCluster cluster, String topicName) {
    if (statisticsCache.get(cluster).getFeatures().contains(Feature.TOPIC_DELETION)) {
      return adminClientService.get(cluster).flatMap(c -> c.deleteTopic(topicName))
          .doOnSuccess(t -> statisticsCache.onTopicDelete(cluster, topicName));
    } else {
      return Mono.error(new ValidationException("Topic deletion restricted"));
    }
  }

  public Mono<InternalTopic> cloneTopic(
      KafkaCluster cluster, String topicName, String newTopicName) {
    return loadTopic(cluster, topicName).flatMap(topic ->
        adminClientService.get(cluster)
            .flatMap(ac ->
                ac.createTopic(
                    newTopicName,
                    topic.getPartitionCount(),
                    topic.getReplicationFactor(),
                    topic.getTopicConfigs()
                        .stream()
                        .collect(Collectors
                            .toMap(InternalTopicConfig::getName, InternalTopicConfig::getValue))
                )
            ).thenReturn(newTopicName)
            .flatMap(a -> loadTopicAfterCreation(cluster, newTopicName))
    );
  }

  public Mono<List<InternalTopic>> getTopicsForPagination(KafkaCluster cluster) {
    Statistics stats = statisticsCache.get(cluster);
    return filterExisting(cluster, stats.getTopicDescriptions().keySet())
        .map(lst -> lst.stream()
            .map(topicName ->
                InternalTopic.from(
                    stats.getTopicDescriptions().get(topicName),
                    stats.getTopicConfigs().getOrDefault(topicName, List.of()),
                    InternalPartitionsOffsets.empty(),
                    stats.getMetrics(),
                    stats.getLogDirInfo()))
            .collect(toList())
        );
  }

  private Mono<List<String>> filterExisting(KafkaCluster cluster, Collection<String> topics) {
    return adminClientService.get(cluster).flatMap(ac -> ac.listTopics(true))
        .map(existing -> existing.stream().filter(topics::contains).collect(toList()));
  }

}
