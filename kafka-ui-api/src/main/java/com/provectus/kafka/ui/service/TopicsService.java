package com.provectus.kafka.ui.service;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.exception.TopicMetadataException;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalPartitionsOffsets;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PartitionsIncreaseDTO;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponseDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponseDTO;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import com.provectus.kafka.ui.model.TopicsResponseDTO;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TopicsService {

  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final AdminClientService adminClientService;
  private final ClusterMapper clusterMapper;
  private final DeserializationService deserializationService;
  private final MetricsCache metricsCache;

  public Mono<TopicsResponseDTO> getTopics(KafkaCluster cluster,
                                           Optional<Integer> pageNum,
                                           Optional<Integer> nullablePerPage,
                                           Optional<Boolean> showInternal,
                                           Optional<String> search,
                                           Optional<TopicColumnsToSortDTO> sortBy,
                                           Optional<SortOrderDTO> sortOrder) {
    return adminClientService.get(cluster).flatMap(ac ->
      new Pagination(ac, metricsCache.get(cluster))
          .getPage(pageNum, nullablePerPage, showInternal, search, sortBy, sortOrder)
          .flatMap(page ->
              loadTopics(cluster, page.getTopics())
                  .map(topics ->
                      new TopicsResponseDTO()
                          .topics(topics.stream().map(clusterMapper::toTopic).collect(toList()))
                          .pageCount(page.getTotalPages()))));
  }

  private Mono<List<InternalTopic>> loadTopics(KafkaCluster c, List<String> topics) {
    if (topics.isEmpty()) {
      return Mono.just(List.of());
    }
    return adminClientService.get(c)
        .flatMap(ac ->
            ac.describeTopics(topics).zipWith(ac.getTopicsConfig(topics),
                (descriptions, configs) -> {
                  metricsCache.update(c, descriptions, configs);
                  return getPartitionOffsets(descriptions, ac).map(offsets -> {
                    var metrics = metricsCache.get(c);
                    return createList(
                        topics,
                        descriptions,
                        configs,
                        offsets,
                        metrics.getJmxMetrics(),
                        metrics.getLogDirInfo()
                    );
                  });
                })).flatMap(Function.identity());
  }

  private Mono<InternalTopic> loadTopic(KafkaCluster c, String topicName) {
    return loadTopics(c, List.of(topicName))
        .map(lst -> lst.stream().findFirst().orElseThrow(TopicNotFoundException::new));
  }

  private List<InternalTopic> createList(List<String> orderedNames,
                                         Map<String, TopicDescription> descriptions,
                                         Map<String, List<ConfigEntry>> configs,
                                         InternalPartitionsOffsets partitionsOffsets,
                                         JmxClusterUtil.JmxMetrics jmxMetrics,
                                         InternalLogDirStats logDirInfo) {
    return orderedNames.stream()
        .filter(descriptions::containsKey)
        .map(t -> InternalTopic.from(
            descriptions.get(t),
            configs.getOrDefault(t, List.of()),
            partitionsOffsets,
            jmxMetrics,
            logDirInfo
        ))
        .collect(toList());
  }

  private Mono<InternalPartitionsOffsets> getPartitionOffsets(Map<String, TopicDescription>
                                                                  descriptions,
                                                              ReactiveAdminClient ac) {
    var topicPartitions = descriptions.values().stream()
        .flatMap(desc ->
            desc.partitions().stream().map(p -> new TopicPartition(desc.name(), p.partition())))
        .collect(toList());

    return ac.listOffsets(topicPartitions, OffsetSpec.earliest())
        .zipWith(ac.listOffsets(topicPartitions, OffsetSpec.latest()),
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

  public Mono<TopicDetailsDTO> getTopicDetails(KafkaCluster cluster, String topicName) {
    return loadTopic(cluster, topicName).map(clusterMapper::toTopicDetails);
  }

  public Mono<List<TopicConfigDTO>> getTopicConfigs(KafkaCluster cluster, String topicName) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.getTopicsConfig(List.of(topicName)))
        .map(m -> m.values().stream().findFirst().orElseThrow(TopicNotFoundException::new))
        .map(lst -> lst.stream()
            .map(InternalTopicConfig::from)
            .map(clusterMapper::toTopicConfig)
            .collect(toList()));
  }

  private Mono<InternalTopic> createTopic(KafkaCluster c, ReactiveAdminClient adminClient,
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
        .flatMap(topicData -> loadTopic(c, topicData.getName()));
  }

  public Mono<TopicDTO> createTopic(KafkaCluster cluster, Mono<TopicCreationDTO> topicCreation) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createTopic(cluster, ac, topicCreation))
        .map(clusterMapper::toTopic);
  }

  private Mono<InternalTopic> updateTopic(KafkaCluster cluster,
                                         String topicName,
                                         TopicUpdateDTO topicUpdate) {
    return adminClientService.get(cluster)
        .flatMap(ac ->
            ac.updateTopicConfig(topicName, topicUpdate.getConfigs())
                .then(loadTopic(cluster, topicName)));
  }

  public Mono<TopicDTO> updateTopic(KafkaCluster cl, String topicName,
                                    Mono<TopicUpdateDTO> topicUpdate) {
    return topicUpdate
        .flatMap(t -> updateTopic(cl, topicName, t))
        .map(clusterMapper::toTopic);
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
          Integer brokersCount = metricsCache.get(cluster).getClusterDescription()
              .getNodes().size();

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
            .collect(toList());

        // Iterate brokers and try to remove them from assignment
        // while (partition replicas count != requested replication factor)
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
    Map<Integer, Integer> result = metricsCache.get(cluster).getClusterDescription().getNodes()
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
        })
        .map(t -> new PartitionsIncreaseResponseDTO()
            .topicName(t.getName())
            .totalPartitionsCount(t.getPartitionCount())));
  }

  public Mono<Void> deleteTopic(KafkaCluster cluster, String topicName) {
    if (metricsCache.get(cluster).getFeatures().contains(Feature.TOPIC_DELETION)) {
      return adminClientService.get(cluster).flatMap(c -> c.deleteTopic(topicName))
          .doOnSuccess(t -> metricsCache.onTopicDelete(cluster, topicName));
    } else {
      return Mono.error(new ValidationException("Topic deletion restricted"));
    }
  }

  public TopicMessageSchemaDTO getTopicSchema(KafkaCluster cluster, String topicName) {
    if (!metricsCache.get(cluster).getTopicDescriptions().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return deserializationService
        .getRecordDeserializerForCluster(cluster)
        .getTopicSchema(topicName);
  }

  @VisibleForTesting
  @Value
  static class Pagination {
    ReactiveAdminClient adminClient;
    MetricsCache.Metrics metrics;

    @Value
    static class Page {
      List<String> topics;
      int totalPages;
    }

    Mono<Page> getPage(
        Optional<Integer> pageNum,
        Optional<Integer> nullablePerPage,
        Optional<Boolean> showInternal,
        Optional<String> search,
        Optional<TopicColumnsToSortDTO> sortBy,
        Optional<SortOrderDTO> sortOrder) {
      return geTopicsForPagination()
          .map(paginatingTopics -> {
            Predicate<Integer> positiveInt = i -> i > 0;
            int perPage = nullablePerPage.filter(positiveInt).orElse(DEFAULT_PAGE_SIZE);
            var topicsToSkip = (pageNum.filter(positiveInt).orElse(1) - 1) * perPage;
            var comparator = sortOrder.isEmpty() || !sortOrder.get().equals(SortOrderDTO.DESC)
                ? getComparatorForTopic(sortBy) : getComparatorForTopic(sortBy).reversed();
            List<InternalTopic> topics = paginatingTopics.stream()
                .filter(topic -> !topic.isInternal()
                    || showInternal.map(i -> topic.isInternal() == i).orElse(true))
                .filter(topic ->
                    search
                        .map(s -> StringUtils.containsIgnoreCase(topic.getName(), s))
                        .orElse(true))
                .sorted(comparator)
                .collect(toList());
            var totalPages = (topics.size() / perPage)
                + (topics.size() % perPage == 0 ? 0 : 1);

            List<String> topicsToRender = topics.stream()
                .skip(topicsToSkip)
                .limit(perPage)
                .map(InternalTopic::getName)
                .collect(toList());

            return new Page(topicsToRender, totalPages);
          });
    }

    private Comparator<InternalTopic> getComparatorForTopic(
        Optional<TopicColumnsToSortDTO> sortBy) {
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

    private Mono<List<String>> filterExisting(Collection<String> topics) {
      return adminClient.listTopics(true)
          .map(existing -> existing.stream().filter(topics::contains).collect(toList()));
    }

    private Mono<List<InternalTopic>> geTopicsForPagination() {
      return filterExisting(metrics.getTopicDescriptions().keySet())
          .map(lst -> lst.stream()
              .map(topicName ->
                  InternalTopic.from(
                      metrics.getTopicDescriptions().get(topicName),
                      metrics.getTopicConfigs().getOrDefault(topicName, List.of()),
                      InternalPartitionsOffsets.empty(),
                      metrics.getJmxMetrics(),
                      metrics.getLogDirInfo()))
              .collect(toList())
          );
    }
  }

}
