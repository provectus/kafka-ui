package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.util.Constants.DELETE_TOPIC_ENABLE;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.mapper.DescribeLogDirsMapper;
import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.BrokerConfig;
import com.provectus.kafka.ui.model.BrokerLogdirUpdate;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.BrokersLogdirs;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.ClusterMetrics;
import com.provectus.kafka.ui.model.ClusterStats;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessage;
import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PartitionsIncrease;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponse;
import com.provectus.kafka.ui.model.ReplicationFactorChange;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponse;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicColumnsToSort;
import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.model.TopicMessageEvent;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.model.TopicUpdate;
import com.provectus.kafka.ui.model.TopicsResponse;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.DeleteConsumerGroupsResult;
import org.apache.kafka.common.errors.GroupIdNotFoundException;
import org.apache.kafka.common.errors.GroupNotEmptyException;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClusterService {
  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final KafkaService kafkaService;
  private final AdminClientService adminClientService;
  private final BrokerService brokerService;
  private final ConsumingService consumingService;
  private final DeserializationService deserializationService;
  private final DescribeLogDirsMapper describeLogDirsMapper;

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
    List<InternalTopic> topics = cluster.getTopics().values().stream()
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
    return new TopicsResponse()
        .pageCount(totalPages)
        .topics(
            topics.stream()
                .skip(topicsToSkip)
                .limit(perPage)
                .map(t ->
                    clusterMapper.toTopic(
                        t.toBuilder().partitions(
                          kafkaService.getTopicPartitions(cluster, t)
                        ).build()
                    )
                )
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
      case REPLICATION_FACTOR:
        return Comparator.comparing(InternalTopic::getReplicationFactor);
      case NAME:
      default:
        return defaultComparator;
    }
  }

  public Optional<TopicDetails> getTopicDetails(String name, String topicName) {
    return clustersStorage.getClusterByName(name)
        .flatMap(c ->
            Optional.ofNullable(c.getTopics()).map(l -> l.get(topicName)).map(
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
    return kafkaService.getConsumerGroups(
        cluster,
        Optional.empty(),
        Collections.singletonList(consumerGroupId)
    ).filter(groups -> !groups.isEmpty()).map(groups -> groups.get(0)).map(
        ClusterUtil::convertToConsumerGroupDetails
    );
  }

  public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName) {
    return getConsumerGroups(clusterName, Optional.empty());
  }

  public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName, Optional<String> topic) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
        .flatMap(c -> kafkaService.getConsumerGroups(c, topic, Collections.emptyList()))
        .map(c ->
            c.stream().map(ClusterUtil::convertToConsumerGroup).collect(Collectors.toList())
        );
  }

  public Flux<Broker> getBrokers(String clusterName) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
        .flatMapMany(brokerService::getBrokers);
  }

  public Flux<BrokerConfig> getBrokerConfig(String clusterName, Integer brokerId) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
        .flatMapMany(c -> brokerService.getBrokersConfig(c, brokerId))
        .map(clusterMapper::toBrokerConfig);
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
    if (cluster.getFeatures().contains(Feature.TOPIC_DELETION)) {
      return kafkaService.deleteTopic(cluster, topic.getName())
          .doOnSuccess(t -> updateCluster(topicName, clusterName, cluster));
    } else {
      return Mono.error(new ValidationException("Topic deletion restricted"));
    }
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

  public Mono<Cluster> updateCluster(String clusterName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> kafkaService.getUpdatedCluster(cluster)
            .doOnNext(updatedCluster -> clustersStorage
                .setKafkaCluster(updatedCluster.getName(), updatedCluster))
            .map(clusterMapper::toCluster))
        .orElse(Mono.error(new ClusterNotFoundException()));
  }

  public Flux<TopicMessageEvent> getMessages(String clusterName, String topicName,
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

  public Mono<PartitionsIncreaseResponse> increaseTopicPartitions(
      String clusterName,
      String topicName,
      PartitionsIncrease partitionsIncrease) {
    return clustersStorage.getClusterByName(clusterName).map(cluster ->
        kafkaService.increaseTopicPartitions(cluster, topicName, partitionsIncrease)
            .doOnNext(t -> updateCluster(t, cluster.getName(), cluster))
            .map(t -> new PartitionsIncreaseResponse()
                .topicName(t.getName())
                .totalPartitionsCount(t.getPartitionCount())))
        .orElse(Mono.error(new ClusterNotFoundException(
            String.format("No cluster for name '%s'", clusterName)
        )));
  }

  public Mono<Void> deleteConsumerGroupById(String clusterName,
                                            String groupId) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> adminClientService.getOrCreateAdminClient(cluster)
            .map(ExtendedAdminClient::getAdminClient)
            .flatMap(adminClient ->
                ClusterUtil.toMono(
                    adminClient.deleteConsumerGroups(List.of(groupId)).all()
                )
            )
            .onErrorResume(this::reThrowCustomException)
        )
        .orElse(Mono.empty());
  }

  public TopicMessageSchema getTopicSchema(String clusterName, String topicName) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(ClusterNotFoundException::new);
    if (!cluster.getTopics().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return deserializationService
        .getRecordDeserializerForCluster(cluster)
        .getTopicSchema(topicName);
  }

  public Mono<Void> sendMessage(String clusterName, String topicName, CreateTopicMessage msg) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(ClusterNotFoundException::new);
    if (!cluster.getTopics().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    if (msg.getKey() == null && msg.getContent() == null) {
      throw new ValidationException("Invalid message: both key and value can't be null");
    }
    if (msg.getPartition() != null
        && msg.getPartition() > cluster.getTopics().get(topicName).getPartitionCount() - 1) {
      throw new ValidationException("Invalid partition");
    }
    return kafkaService.sendMessage(cluster, topicName, msg).then();
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

  public Mono<ReplicationFactorChangeResponse> changeReplicationFactor(
      String clusterName,
      String topicName,
      ReplicationFactorChange replicationFactorChange) {
    return clustersStorage.getClusterByName(clusterName).map(cluster ->
        kafkaService.changeReplicationFactor(cluster, topicName, replicationFactorChange)
            .doOnNext(topic -> updateCluster(topic, cluster.getName(), cluster))
            .map(t -> new ReplicationFactorChangeResponse()
                .topicName(t.getName())
                .totalReplicationFactor(t.getReplicationFactor())))
        .orElse(Mono.error(new ClusterNotFoundException(
            String.format("No cluster for name '%s'", clusterName))));
  }

  public Flux<BrokersLogdirs> getAllBrokersLogdirs(String clusterName, List<Integer> brokers) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .flatMap(c -> kafkaService.getClusterLogDirs(c, brokers))
        .map(describeLogDirsMapper::toBrokerLogDirsList)
        .flatMapMany(Flux::fromIterable);
  }

  public Mono<Void> updateBrokerLogDir(
      String clusterName, Integer id, BrokerLogdirUpdate brokerLogDir) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .flatMap(c -> kafkaService.updateBrokerLogDir(c, id, brokerLogDir));
  }

  public Mono<Void> updateBrokerConfigByName(String clusterName,
                                             Integer id,
                                             String name,
                                             String value) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(clusterName))
        .flatMap(c -> kafkaService.updateBrokerConfigByName(c, id, name, value));
  }
}