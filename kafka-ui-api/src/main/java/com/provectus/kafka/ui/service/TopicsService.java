package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.TopicMetadataException;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.CleanupPolicy;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PartitionsIncreaseDTO;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponseDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponseDTO;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import com.provectus.kafka.ui.model.TopicsResponseDTO;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TopicsService {

  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final AdminClientService adminClientService;
  private final ConsumerGroupService consumerGroupService;
  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final DeserializationService deserializationService;

  public TopicsResponseDTO getTopics(KafkaCluster cluster,
                                     Optional<Integer> page,
                                     Optional<Integer> nullablePerPage,
                                     Optional<Boolean> showInternal,
                                     Optional<String> search,
                                     Optional<TopicColumnsToSortDTO> sortBy) {
    Predicate<Integer> positiveInt = i -> i > 0;
    int perPage = nullablePerPage.filter(positiveInt).orElse(DEFAULT_PAGE_SIZE);
    var topicsToSkip = (page.filter(positiveInt).orElse(1) - 1) * perPage;
    List<InternalTopic> topics = cluster.getMetrics().getTopics().values().stream()
        .filter(topic -> !topic.isInternal()
            || showInternal
            .map(i -> topic.isInternal() == i)
            .orElse(true))
        .filter(topic ->
            search
                .map(s -> StringUtils.containsIgnoreCase(topic.getName(), s))
                .orElse(true))
        .sorted(getComparatorForTopic(sortBy))
        .collect(Collectors.toList());
    var totalPages = (topics.size() / perPage)
        + (topics.size() % perPage == 0 ? 0 : 1);
    return new TopicsResponseDTO()
        .pageCount(totalPages)
        .topics(
            topics.stream()
                .skip(topicsToSkip)
                .limit(perPage)
                .map(t ->
                    clusterMapper.toTopic(
                        t.toBuilder().partitions(getTopicPartitions(cluster, t)).build()
                    )
                )
                .collect(Collectors.toList())
        );
  }

  private Comparator<InternalTopic> getComparatorForTopic(Optional<TopicColumnsToSortDTO> sortBy) {
    var defaultComparator = Comparator.comparing(InternalTopic::getName);
    if (sortBy.isEmpty()) {
      return defaultComparator;
    }
    switch (sortBy.get()) {
      case TOTAL_PARTITIONS:
        return Comparator.comparing(InternalTopic::getPartitionCount);
      case OUT_OF_SYNC_REPLICAS:
        return Comparator.comparing(t -> t.getReplicas() - t.getInSyncReplicas());
      case REPLICATION_FACTOR:
        return Comparator.comparing(InternalTopic::getReplicationFactor);
      case NAME:
      default:
        return defaultComparator;
    }
  }

  public TopicDetailsDTO getTopicDetails(KafkaCluster cluster, String topicName) {
    var topic = getTopic(cluster, topicName);
    var upToDatePartitions = getTopicPartitions(cluster, topic);
    topic = topic.toBuilder().partitions(upToDatePartitions).build();
    return clusterMapper.toTopicDetails(topic);
  }

  @SneakyThrows
  public Mono<List<InternalTopic>> getTopicsData(ReactiveAdminClient client) {
    return client.listTopics(true)
        .flatMap(topics -> getTopicsData(client, topics).collectList());
  }

  private Flux<InternalTopic> getTopicsData(ReactiveAdminClient client, Collection<String> topics) {
    final Mono<Map<String, List<InternalTopicConfig>>> configsMono =
        loadTopicsConfig(client, topics);

    return client.describeTopics(topics)
        .map(m -> m.values().stream()
            .map(ClusterUtil::mapToInternalTopic).collect(Collectors.toList()))
        .flatMap(internalTopics -> configsMono
            .map(configs -> mergeWithConfigs(internalTopics, configs).values()))
        .flatMapMany(Flux::fromIterable);
  }

  public List<TopicConfigDTO> getTopicConfigs(KafkaCluster cluster, String topicName) {
    var configs =  getTopic(cluster, topicName).getTopicConfigs();
    return configs.stream()
        .map(clusterMapper::toTopicConfig)
        .collect(Collectors.toList());
  }


  @SneakyThrows
  private Mono<InternalTopic> createTopic(ReactiveAdminClient adminClient,
                                         Mono<TopicCreationDTO> topicCreation) {
    return topicCreation.flatMap(topicData ->
            adminClient.createTopic(
                topicData.getName(),
                topicData.getPartitions(),
                topicData.getReplicationFactor().shortValue(),
                topicData.getConfigs()
            ).thenReturn(topicData)
        )
        .onErrorResume(t -> Mono.error(new TopicMetadataException(t.getMessage())))
        .flatMap(topicData -> getUpdatedTopic(adminClient, topicData.getName()))
        .switchIfEmpty(Mono.error(new RuntimeException("Can't find created topic")));
  }

  public Mono<TopicDTO> createTopic(
      KafkaCluster cluster, Mono<TopicCreationDTO> topicCreation) {
    return adminClientService.get(cluster).flatMap(ac -> createTopic(ac, topicCreation))
        .doOnNext(t -> clustersStorage.onTopicUpdated(cluster.getName(), t))
        .map(clusterMapper::toTopic);
  }

  private Map<String, InternalTopic> mergeWithConfigs(
      List<InternalTopic> topics, Map<String, List<InternalTopicConfig>> configs) {
    return topics.stream()
        .map(t -> t.toBuilder().topicConfigs(configs.get(t.getName())).build())
        .map(t -> t.toBuilder().cleanUpPolicy(
            CleanupPolicy.fromString(t.getTopicConfigs().stream()
                .filter(config -> config.getName().equals("cleanup.policy"))
                .findFirst()
                .orElseGet(() -> InternalTopicConfig.builder().value("unknown").build())
                .getValue())).build())
        .collect(Collectors.toMap(
            InternalTopic::getName,
            e -> e
        ));
  }

  public Mono<InternalTopic> getUpdatedTopic(ReactiveAdminClient ac, String topicName) {
    return getTopicsData(ac, List.of(topicName)).next();
  }

  public Mono<InternalTopic> updateTopic(KafkaCluster cluster,
                                         String topicName,
                                         TopicUpdateDTO topicUpdate) {
    return adminClientService.get(cluster)
        .flatMap(ac ->
            ac.updateTopicConfig(topicName,
                topicUpdate.getConfigs()).then(getUpdatedTopic(ac, topicName)));
  }

  public Mono<TopicDTO> updateTopic(KafkaCluster cl, String topicName,
                                    Mono<TopicUpdateDTO> topicUpdate) {
    return topicUpdate
        .flatMap(t -> updateTopic(cl, topicName, t))
        .doOnNext(t -> clustersStorage.onTopicUpdated(cl.getName(), t))
        .map(clusterMapper::toTopic);
  }

  @SneakyThrows
  private Mono<Map<String, List<InternalTopicConfig>>> loadTopicsConfig(
      ReactiveAdminClient client, Collection<String> topicNames) {
    return client.getTopicsConfig(topicNames)
        .map(configs ->
            configs.entrySet().stream().collect(Collectors.toMap(
                Map.Entry::getKey,
                c -> c.getValue().stream()
                    .map(ClusterUtil::mapToInternalTopicConfig)
                    .collect(Collectors.toList()))));
  }

  private Mono<InternalTopic> changeReplicationFactor(
      ReactiveAdminClient adminClient,
      String topicName,
      Map<TopicPartition, Optional<NewPartitionReassignment>> reassignments
  ) {
    return adminClient.alterPartitionReassignments(reassignments)
        .then(getUpdatedTopic(adminClient, topicName));
  }

  /**
   * Change topic replication factor, works on brokers versions 5.4.x and higher
   */
  public Mono<ReplicationFactorChangeResponseDTO> changeReplicationFactor(
      KafkaCluster cluster,
      String topicName,
      ReplicationFactorChangeDTO replicationFactorChange) {
    return adminClientService.get(cluster)
        .flatMap(ac -> {
          Integer actual = getTopic(cluster, topicName).getReplicationFactor();
          Integer requested = replicationFactorChange.getTotalReplicationFactor();
          Integer brokersCount = cluster.getMetrics().getBrokerCount();

          if (requested.equals(actual)) {
            return Mono.error(
                new ValidationException(
                    String.format("Topic already has replicationFactor %s.", actual)));
          }
          if (requested > brokersCount) {
            return Mono.error(
                new ValidationException(
                    String.format("Requested replication factor %s more than brokers count %s.",
                        requested, brokersCount)));
          }
          return changeReplicationFactor(ac, topicName,
              getPartitionsReassignments(cluster, topicName,
                  replicationFactorChange));
        })
        .doOnNext(topic -> clustersStorage.onTopicUpdated(cluster.getName(), topic))
        .map(t -> new ReplicationFactorChangeResponseDTO()
            .topicName(t.getName())
            .totalReplicationFactor(t.getReplicationFactor()));
  }

  private Map<TopicPartition, Optional<NewPartitionReassignment>> getPartitionsReassignments(
      KafkaCluster cluster,
      String topicName,
      ReplicationFactorChangeDTO replicationFactorChange) {
    // Current assignment map (Partition number -> List of brokers)
    Map<Integer, List<Integer>> currentAssignment = getCurrentAssignment(cluster, topicName);
    // Brokers map (Broker id -> count)
    Map<Integer, Integer> brokersUsage = getBrokersMap(cluster, currentAssignment);
    int currentReplicationFactor = getTopic(cluster, topicName).getReplicationFactor();

    // If we should to increase Replication factor
    if (replicationFactorChange.getTotalReplicationFactor() > currentReplicationFactor) {
      // For each partition
      for (var assignmentList : currentAssignment.values()) {
        // Get brokers list sorted by usage
        var brokers = brokersUsage.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // Iterate brokers and try to add them in assignment
        // while (partition replicas count != requested replication factor)
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
            .collect(Collectors.toList());

        // Iterate brokers and try to remove them from assignment
        // while (partition replicas count != requested replication factor)
        for (Integer broker : brokersUsageList) {
          // Check is the broker the leader of partition
          if (!getTopic(cluster, topicName).getPartitions().get(partition).getLeader()
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
    return currentAssignment.entrySet().stream().collect(Collectors.toMap(
        e -> new TopicPartition(topicName, e.getKey()),
        e -> Optional.of(new NewPartitionReassignment(e.getValue()))
    ));
  }

  private Map<Integer, List<Integer>> getCurrentAssignment(KafkaCluster cluster, String topicName) {
    return getTopic(cluster, topicName).getPartitions().values().stream()
        .collect(Collectors.toMap(
            InternalPartition::getPartition,
            p -> p.getReplicas().stream()
                .map(InternalReplica::getBroker)
                .collect(Collectors.toList())
        ));
  }

  private Map<Integer, Integer> getBrokersMap(KafkaCluster cluster,
                                              Map<Integer, List<Integer>> currentAssignment) {
    Map<Integer, Integer> result = cluster.getMetrics().getBrokers().stream()
        .collect(Collectors.toMap(
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
    return adminClientService.get(cluster)
        .flatMap(ac -> {
          Integer actualCount = getTopic(cluster, topicName).getPartitionCount();
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
              .then(getUpdatedTopic(ac, topicName));
        })
        .doOnNext(t -> clustersStorage.onTopicUpdated(cluster.getName(), t))
        .map(t -> new PartitionsIncreaseResponseDTO()
            .topicName(t.getName())
            .totalPartitionsCount(t.getPartitionCount()));
  }

  private Map<Integer, InternalPartition> getTopicPartitions(KafkaCluster c, InternalTopic topic) {
    var tps = topic.getPartitions().values().stream()
        .map(t -> new TopicPartition(topic.getName(), t.getPartition()))
        .collect(Collectors.toList());
    Map<Integer, InternalPartition> partitions =
        topic.getPartitions().values().stream().collect(Collectors.toMap(
            InternalPartition::getPartition,
            tp -> tp
        ));

    try (var consumer = consumerGroupService.createConsumer(c)) {
      final Map<TopicPartition, Long> earliest = consumer.beginningOffsets(tps);
      final Map<TopicPartition, Long> latest = consumer.endOffsets(tps);

      return tps.stream()
          .map(tp -> partitions.get(tp.partition())
              .withOffsets(
                  earliest.getOrDefault(tp, -1L),
                  latest.getOrDefault(tp, -1L)
              )
          ).collect(Collectors.toMap(
              InternalPartition::getPartition,
              tp -> tp
          ));
    } catch (Exception e) {
      return Collections.emptyMap();
    }
  }

  public Mono<Void> deleteTopic(KafkaCluster cluster, String topicName) {
    var topicDetails = getTopicDetails(cluster, topicName);
    if (cluster.getFeatures().contains(Feature.TOPIC_DELETION)) {
      return adminClientService.get(cluster).flatMap(c -> c.deleteTopic(topicName))
          .doOnSuccess(t -> clustersStorage.onTopicDeleted(cluster.getName(), topicName));
    } else {
      return Mono.error(new ValidationException("Topic deletion restricted"));
    }
  }

  public TopicMessageSchemaDTO getTopicSchema(KafkaCluster cluster, String topicName) {
    if (!cluster.getMetrics().getTopics().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return deserializationService
        .getRecordDeserializerForCluster(cluster)
        .getTopicSchema(topicName);
  }

  private InternalTopic getTopic(KafkaCluster c, String topicName) {
    var topic = c.getMetrics().getTopics().get(topicName);
    if (topic == null) {
      throw new TopicNotFoundException();
    }
    return topic;
  }

}
