package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.ClusterMetrics;
import com.provectus.kafka.ui.model.ClusterStats;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicColumnsToSort;
import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicConsumerGroups;
import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.model.TopicUpdate;
import com.provectus.kafka.ui.model.TopicsResponse;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.DeleteConsumerGroupsResult;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.GroupIdNotFoundException;
import org.apache.kafka.common.errors.GroupNotEmptyException;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClusterService {
  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final KafkaService kafkaService;
  private final ConsumingService consumingService;

  public List<Cluster> getClusters() {
    return clustersStorage.getKafkaClusters()
        .stream()
        .map(clusterMapper::toCluster)
        .collect(Collectors.toList());
  }

  public Mono<BrokerMetrics> getBrokerMetrics(String name, Integer id) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(name)
        .map(c -> c.getMetrics().getInternalBrokerMetrics())
        .map(m -> m.get(id))
        .map(clusterMapper::toBrokerMetrics));
  }

  public Mono<ClusterStats> getClusterStats(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterStats)
    );
  }

  public Mono<ClusterMetrics> getClusterMetrics(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterMetrics)
    );
  }


  public TopicsResponse getTopics(String name, Optional<Integer> page,
                                  Optional<Integer> nullablePerPage,
                                  Optional<Boolean> showInternal,
                                  Optional<String> search,
                                  Optional<TopicColumnsToSort> sortBy) {
    Predicate<Integer> positiveInt = i -> i > 0;
    int perPage = nullablePerPage.filter(positiveInt).orElse(DEFAULT_PAGE_SIZE);
    var topicsToSkip = (page.filter(positiveInt).orElse(1) - 1) * perPage;
    var cluster = clustersStorage.getClusterByName(name)
        .orElseThrow(ClusterNotFoundException::new);
    List<Topic> topics = cluster.getTopics().values().stream()
        .filter(topic -> !topic.isInternal()
            || showInternal
            .map(i -> topic.isInternal() == i)
            .orElse(true))
        .filter(topic ->
            search
                .map(s -> StringUtils.containsIgnoreCase(topic.getName(), s))
                .orElse(true))
        .sorted(getComparatorForTopic(sortBy))
        .map(clusterMapper::toTopic)
        .collect(Collectors.toList());
    var totalPages = (topics.size() / perPage)
        + (topics.size() % perPage == 0 ? 0 : 1);
    return new TopicsResponse()
        .pageCount(totalPages)
        .topics(
            topics.stream()
                .skip(topicsToSkip)
                .limit(perPage)
                .collect(Collectors.toList())
        );
  }

  private Comparator<InternalTopic> getComparatorForTopic(Optional<TopicColumnsToSort> sortBy) {
    var defaultComparator = Comparator.comparing(InternalTopic::getName);
    if (sortBy.isEmpty()) {
      return defaultComparator;
    }
    switch (sortBy.get()) {
      case TOTAL_PARTITIONS:
        return Comparator.comparing(InternalTopic::getPartitionCount);
      case OUT_OF_SYNC_REPLICAS:
        return Comparator.comparing(t -> t.getReplicas() - t.getInSyncReplicas());
      case NAME:
      default:
        return defaultComparator;
    }
  }

  public Optional<TopicDetails> getTopicDetails(String name, String topicName) {
    return clustersStorage.getClusterByName(name)
        .flatMap(c ->
            Optional.ofNullable(
                c.getTopics().get(topicName)
            ).map(
                t -> t.toBuilder().partitions(
                    kafkaService.getTopicPartitions(c, t)
                ).build()
            ).map(t -> clusterMapper.toTopicDetails(t, c.getMetrics()))
        );
  }

  public Optional<List<TopicConfig>> getTopicConfigs(String name, String topicName) {
    return clustersStorage.getClusterByName(name)
        .map(KafkaCluster::getTopics)
        .map(t -> t.get(topicName))
        .map(t -> t.getTopicConfigs().stream().map(clusterMapper::toTopicConfig)
            .collect(Collectors.toList()));
  }

  public Mono<Topic> createTopic(String clusterName, Mono<TopicCreation> topicCreation) {
    return clustersStorage.getClusterByName(clusterName).map(cluster ->
        kafkaService.createTopic(cluster, topicCreation)
            .doOnNext(t -> updateCluster(t, clusterName, cluster))
            .map(clusterMapper::toTopic)
    ).orElse(Mono.empty());
  }

  @SneakyThrows
  public Mono<ConsumerGroupDetails> getConsumerGroupDetail(String clusterName,
                                                           String consumerGroupId) {
    var cluster = clustersStorage.getClusterByName(clusterName).orElseThrow(Throwable::new);

    return kafkaService.getOrCreateAdminClient(cluster).map(ac ->
        ac.getAdminClient().describeConsumerGroups(Collections.singletonList(consumerGroupId)).all()
    ).flatMap(groups ->
        kafkaService.groupMetadata(cluster, consumerGroupId)
            .flatMap(offsets -> {
              Map<TopicPartition, Long> endOffsets =
                  kafkaService.topicPartitionsEndOffsets(cluster, offsets.keySet());
              return ClusterUtil.toMono(groups).map(s ->
                  Tuples.of(
                      s.get(consumerGroupId),
                      s.get(consumerGroupId).members().stream()
                          .flatMap(c ->
                              Stream.of(
                                  ClusterUtil.convertToConsumerTopicPartitionDetails(
                                      c, offsets, endOffsets, consumerGroupId
                                  )
                              )
                          )
                          .collect(Collectors.toList()).stream()
                          .flatMap(t ->
                              t.stream().flatMap(Stream::of)
                          ).collect(Collectors.toList())
                  )
              );
            }).map(c -> ClusterUtil.convertToConsumerGroupDetails(c.getT1(), c.getT2()))
    );
  }

  public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
        .flatMap(kafkaService::getConsumerGroups);
  }

  public Mono<TopicConsumerGroups> getTopicConsumerGroupDetail(
      String clusterName, String topicName) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
        .flatMap(c -> kafkaService.getTopicConsumerGroups(c, topicName));
  }

  public Flux<Broker> getBrokers(String clusterName) {
    return kafkaService
        .getOrCreateAdminClient(clustersStorage.getClusterByName(clusterName).orElseThrow())
        .flatMap(client -> ClusterUtil.toMono(client.getAdminClient().describeCluster().nodes())
            .map(n -> n.stream().map(node -> {
              Broker broker = new Broker();
              broker.setId(node.id());
              broker.setHost(node.host());
              return broker;
            }).collect(Collectors.toList())))
        .flatMapMany(Flux::fromIterable);
  }

  @SneakyThrows
  public Mono<Topic> updateTopic(String clusterName, String topicName,
                                 Mono<TopicUpdate> topicUpdate) {
    return clustersStorage.getClusterByName(clusterName).map(cl ->
        topicUpdate
            .flatMap(t -> kafkaService.updateTopic(cl, topicName, t))
            .doOnNext(t -> updateCluster(t, clusterName, cl))
            .map(clusterMapper::toTopic)
    ).orElse(Mono.empty());
  }

  public Mono<Void> deleteTopic(String clusterName, String topicName) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(ClusterNotFoundException::new);
    var topic = getTopicDetails(clusterName, topicName)
        .orElseThrow(TopicNotFoundException::new);
    return kafkaService.deleteTopic(cluster, topic.getName())
        .doOnNext(t -> updateCluster(topicName, clusterName, cluster));
  }

  private KafkaCluster updateCluster(InternalTopic topic, String clusterName,
                                     KafkaCluster cluster) {
    final KafkaCluster updatedCluster = kafkaService.getUpdatedCluster(cluster, topic);
    clustersStorage.setKafkaCluster(clusterName, updatedCluster);
    return updatedCluster;
  }

  private KafkaCluster updateCluster(String topicToDelete, String clusterName,
                                     KafkaCluster cluster) {
    final KafkaCluster updatedCluster = kafkaService.getUpdatedCluster(cluster, topicToDelete);
    clustersStorage.setKafkaCluster(clusterName, updatedCluster);
    return updatedCluster;
  }

  public Flux<TopicMessage> getMessages(String clusterName, String topicName,
                                        ConsumerPosition consumerPosition, String query,
                                        Integer limit) {
    return clustersStorage.getClusterByName(clusterName)
        .map(c -> consumingService.loadMessages(c, topicName, consumerPosition, query, limit))
        .orElse(Flux.empty());
  }

  public Mono<Void> deleteTopicMessages(String clusterName, String topicName,
                                        List<Integer> partitions) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(ClusterNotFoundException::new);
    if (!cluster.getTopics().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return consumingService.offsetsForDeletion(cluster, topicName, partitions)
        .flatMap(offsets -> kafkaService.deleteTopicMessages(cluster, offsets));
  }

  public Mono<Void> deleteConsumerGroupById(String clusterName,
                                            String groupId) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> kafkaService.getOrCreateAdminClient(cluster)
            .map(ExtendedAdminClient::getAdminClient)
            .map(adminClient -> adminClient.deleteConsumerGroups(List.of(groupId)))
            .map(DeleteConsumerGroupsResult::all)
            .flatMap(ClusterUtil::toMono)
            .onErrorResume(this::reThrowCustomException)
        )
        .orElse(Mono.empty());
  }

  @NotNull
  private Mono<Void> reThrowCustomException(Throwable e) {
    if (e instanceof GroupIdNotFoundException) {
      return Mono.error(new NotFoundException("The group id does not exist"));
    } else if (e instanceof GroupNotEmptyException) {
      return Mono.error(new IllegalEntityStateException("The group is not empty"));
    } else {
      return Mono.error(e);
    }
  }
}