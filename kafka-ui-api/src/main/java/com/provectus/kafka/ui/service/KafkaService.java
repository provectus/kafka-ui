package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.CreateTopicMessage;
import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalBrokerMetrics;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalSegmentSizeDto;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metric;
import com.provectus.kafka.ui.model.PartitionsIncrease;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponse;
import com.provectus.kafka.ui.model.ServerStatus;
import com.provectus.kafka.ui.model.TopicConsumerGroups;
import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicUpdate;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.ClusterUtil;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import com.provectus.kafka.ui.util.JmxMetricsName;
import com.provectus.kafka.ui.util.JmxMetricsValueName;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.RecordsToDelete;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaService {

  private static final ListTopicsOptions LIST_TOPICS_OPTIONS =
      new ListTopicsOptions().listInternal(true);
  private final ZookeeperService zookeeperService;
  private final Map<String, ExtendedAdminClient> adminClientCache = new ConcurrentHashMap<>();
  private final JmxClusterUtil jmxClusterUtil;
  private final ClustersStorage clustersStorage;
  private final DeserializationService deserializationService;
  @Value("${kafka.admin-client-timeout}")
  private int clientTimeout;

  public KafkaCluster getUpdatedCluster(KafkaCluster cluster, InternalTopic updatedTopic) {
    final Map<String, InternalTopic> topics = new HashMap<>(cluster.getTopics());
    topics.put(updatedTopic.getName(), updatedTopic);
    return cluster.toBuilder().topics(topics).build();
  }

  public KafkaCluster getUpdatedCluster(KafkaCluster cluster, String topicToDelete) {
    final Map<String, InternalTopic> topics = new HashMap<>(cluster.getTopics());
    topics.remove(topicToDelete);
    return cluster.toBuilder().topics(topics).build();
  }

  @SneakyThrows
  public Mono<KafkaCluster> getUpdatedCluster(KafkaCluster cluster) {
    return getOrCreateAdminClient(cluster)
        .flatMap(
            ac -> getClusterMetrics(ac.getAdminClient())
                .flatMap(i -> fillJmxMetrics(i, cluster.getName(), ac.getAdminClient()))
                .flatMap(clusterMetrics ->
                    getTopicsData(ac.getAdminClient()).flatMap(it ->
                        updateSegmentMetrics(ac.getAdminClient(), clusterMetrics, it)
                    ).map(segmentSizeDto -> buildFromData(cluster, segmentSizeDto))
                )
        ).onErrorResume(
            e -> Mono.just(cluster.toBuilder()
                .status(ServerStatus.OFFLINE)
                .lastKafkaException(e)
                .build())
        );
  }

  private KafkaCluster buildFromData(KafkaCluster currentCluster,
                                     InternalSegmentSizeDto segmentSizeDto) {

    var topics = segmentSizeDto.getInternalTopicWithSegmentSize();
    var brokersMetrics = segmentSizeDto.getClusterMetricsWithSegmentSize();

    InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder =
        brokersMetrics.toBuilder();

    InternalClusterMetrics topicsMetrics = collectTopicsMetrics(topics);

    ServerStatus zookeeperStatus = ServerStatus.OFFLINE;
    Throwable zookeeperException = null;
    try {
      zookeeperStatus = zookeeperService.isZookeeperOnline(currentCluster) ? ServerStatus.ONLINE :
          ServerStatus.OFFLINE;
    } catch (Throwable e) {
      zookeeperException = e;
    }

    InternalClusterMetrics clusterMetrics = metricsBuilder
        .activeControllers(brokersMetrics.getActiveControllers())
        .topicCount(topicsMetrics.getTopicCount())
        .brokerCount(brokersMetrics.getBrokerCount())
        .underReplicatedPartitionCount(topicsMetrics.getUnderReplicatedPartitionCount())
        .inSyncReplicasCount(topicsMetrics.getInSyncReplicasCount())
        .outOfSyncReplicasCount(topicsMetrics.getOutOfSyncReplicasCount())
        .onlinePartitionCount(topicsMetrics.getOnlinePartitionCount())
        .offlinePartitionCount(topicsMetrics.getOfflinePartitionCount())
        .zooKeeperStatus(ClusterUtil.convertToIntServerStatus(zookeeperStatus))
        .build();

    return currentCluster.toBuilder()
        .status(ServerStatus.ONLINE)
        .zookeeperStatus(zookeeperStatus)
        .lastZookeeperException(zookeeperException)
        .lastKafkaException(null)
        .metrics(clusterMetrics)
        .topics(topics)
        .build();
  }

  private InternalClusterMetrics collectTopicsMetrics(Map<String, InternalTopic> topics) {

    int underReplicatedPartitions = 0;
    int inSyncReplicasCount = 0;
    int outOfSyncReplicasCount = 0;
    int onlinePartitionCount = 0;
    int offlinePartitionCount = 0;

    for (InternalTopic topic : topics.values()) {
      underReplicatedPartitions += topic.getUnderReplicatedPartitions();
      inSyncReplicasCount += topic.getInSyncReplicas();
      outOfSyncReplicasCount += (topic.getReplicas() - topic.getInSyncReplicas());
      onlinePartitionCount +=
          topic.getPartitions().values().stream().mapToInt(s -> s.getLeader() == null ? 0 : 1)
              .sum();
      offlinePartitionCount +=
          topic.getPartitions().values().stream().mapToInt(s -> s.getLeader() != null ? 0 : 1)
              .sum();
    }

    return InternalClusterMetrics.builder()
        .underReplicatedPartitionCount(underReplicatedPartitions)
        .inSyncReplicasCount(inSyncReplicasCount)
        .outOfSyncReplicasCount(outOfSyncReplicasCount)
        .onlinePartitionCount(onlinePartitionCount)
        .offlinePartitionCount(offlinePartitionCount)
        .topicCount(topics.size())
        .build();
  }

  private Map<String, InternalTopic> mergeWithConfigs(
      List<InternalTopic> topics, Map<String, List<InternalTopicConfig>> configs) {
    return topics.stream().map(
        t -> t.toBuilder().topicConfigs(configs.get(t.getName())).build()
    ).collect(Collectors.toMap(
        InternalTopic::getName,
        e -> e
    ));
  }

  @SneakyThrows
  private Mono<List<InternalTopic>> getTopicsData(AdminClient adminClient) {
    return ClusterUtil.toMono(adminClient.listTopics(LIST_TOPICS_OPTIONS).names())
        .flatMap(topics -> getTopicsData(adminClient, topics).collectList());
  }

  private Flux<InternalTopic> getTopicsData(AdminClient adminClient, Collection<String> topics) {
    final Mono<Map<String, List<InternalTopicConfig>>> configsMono =
        loadTopicsConfig(adminClient, topics);

    return ClusterUtil.toMono(adminClient.describeTopics(topics).all()).map(
        m -> m.values().stream().map(ClusterUtil::mapToInternalTopic).collect(Collectors.toList())
    ).flatMap(internalTopics -> configsMono.map(configs ->
        mergeWithConfigs(internalTopics, configs).values()
    )).flatMapMany(Flux::fromIterable);
  }


  private Mono<InternalClusterMetrics> getClusterMetrics(AdminClient client) {
    return ClusterUtil.toMono(client.describeCluster().nodes())
        .flatMap(brokers ->
            ClusterUtil.toMono(client.describeCluster().controller()).map(
                c -> {
                  InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder =
                      InternalClusterMetrics.builder();
                  metricsBuilder.brokerCount(brokers.size()).activeControllers(c != null ? 1 : 0);
                  return metricsBuilder.build();
                }
            )
        );
  }

  @SneakyThrows
  private Mono<String> createTopic(AdminClient adminClient, NewTopic newTopic) {
    return ClusterUtil.toMono(adminClient.createTopics(Collections.singletonList(newTopic)).all(),
        newTopic.name());
  }

  @SneakyThrows
  public Mono<InternalTopic> createTopic(AdminClient adminClient,
                                         Mono<TopicCreation> topicCreation) {
    return topicCreation.flatMap(
        topicData -> {
          NewTopic newTopic = new NewTopic(topicData.getName(), topicData.getPartitions(),
              topicData.getReplicationFactor().shortValue());
          newTopic.configs(topicData.getConfigs());
          return createTopic(adminClient, newTopic).map(v -> topicData);
        }).flatMap(
          topicData ->
              getTopicsData(adminClient, Collections.singleton(topicData.getName()))
                  .next()
        ).switchIfEmpty(Mono.error(new RuntimeException("Can't find created topic")))
        .flatMap(t ->
            loadTopicsConfig(adminClient, Collections.singletonList(t.getName()))
                .map(c -> mergeWithConfigs(Collections.singletonList(t), c))
                .map(m -> m.values().iterator().next())
        );
  }

  public Mono<InternalTopic> createTopic(KafkaCluster cluster, Mono<TopicCreation> topicCreation) {
    return getOrCreateAdminClient(cluster)
        .flatMap(ac -> createTopic(ac.getAdminClient(), topicCreation));
  }

  public Mono<Void> deleteTopic(KafkaCluster cluster, String topicName) {
    return getOrCreateAdminClient(cluster)
        .map(ExtendedAdminClient::getAdminClient)
        .map(adminClient -> adminClient.deleteTopics(List.of(topicName)))
        .then();
  }


  @SneakyThrows
  public Mono<ExtendedAdminClient> getOrCreateAdminClient(KafkaCluster cluster) {
    return Mono.justOrEmpty(adminClientCache.get(cluster.getName()))
        .switchIfEmpty(createAdminClient(cluster))
        .map(e -> adminClientCache.computeIfAbsent(cluster.getName(), key -> e));
  }

  public Mono<ExtendedAdminClient> createAdminClient(KafkaCluster kafkaCluster) {
    return Mono.fromSupplier(() -> {
      Properties properties = new Properties();
      properties.putAll(kafkaCluster.getProperties());
      properties
          .put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
      properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
      return AdminClient.create(properties);
    }).flatMap(ExtendedAdminClient::extendedAdminClient);
  }

  @SneakyThrows
  private Mono<Map<String, List<InternalTopicConfig>>> loadTopicsConfig(
      AdminClient adminClient, Collection<String> topicNames) {
    List<ConfigResource> resources = topicNames.stream()
        .map(topicName -> new ConfigResource(ConfigResource.Type.TOPIC, topicName))
        .collect(Collectors.toList());

    return ClusterUtil.toMono(adminClient.describeConfigs(resources).all())
        .map(configs ->
            configs.entrySet().stream().map(
                c -> Tuples.of(
                    c.getKey().name(),
                    c.getValue().entries().stream().map(ClusterUtil::mapToInternalTopicConfig)
                        .collect(Collectors.toList())
                )
            ).collect(Collectors.toMap(
                Tuple2::getT1,
                Tuple2::getT2
            ))
        );
  }

  public Mono<Collection<ConsumerGroupDescription>> getConsumerGroupsInternal(
      KafkaCluster cluster) {
    return getOrCreateAdminClient(cluster).flatMap(ac ->
        ClusterUtil.toMono(ac.getAdminClient().listConsumerGroups().all())
            .flatMap(s ->
                ClusterUtil.toMono(
                    ac.getAdminClient().describeConsumerGroups(
                        s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())
                    ).all()
                ).map(Map::values)
            )
    );
  }

  public Mono<List<ConsumerGroup>> getConsumerGroups(KafkaCluster cluster) {
    return getConsumerGroupsInternal(cluster)
        .map(c -> c.stream().map(ClusterUtil::convertToConsumerGroup).collect(Collectors.toList()));
  }

  public Mono<TopicConsumerGroups> getTopicConsumerGroups(KafkaCluster cluster, String topic) {
    final Map<TopicPartition, Long> endOffsets = topicEndOffsets(cluster, topic);

    return getConsumerGroupsInternal(cluster)
        .flatMapIterable(c ->
            c.stream()
                .map(d -> ClusterUtil.filterConsumerGroupTopic(d, topic))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(d ->
                    groupMetadata(cluster, d.groupId())
                      .flatMapIterable(meta ->
                          d.members().stream().flatMap(m ->
                              ClusterUtil.convertToConsumerTopicPartitionDetails(
                                  m, meta, endOffsets, d.groupId()
                              ).stream()
                          ).collect(Collectors.toList())
                      )
                ).collect(Collectors.toList())
        ).flatMap(f -> f).collectList().map(l -> new TopicConsumerGroups().consumers(l));
  }

  public Mono<Map<TopicPartition, OffsetAndMetadata>> groupMetadata(KafkaCluster cluster,
                                                                    String consumerGroupId) {
    return getOrCreateAdminClient(cluster).map(ac ->
        ac.getAdminClient()
            .listConsumerGroupOffsets(consumerGroupId)
            .partitionsToOffsetAndMetadata()
    ).flatMap(ClusterUtil::toMono);
  }

  public Map<TopicPartition, Long> topicEndOffsets(
      KafkaCluster cluster, String topic) {
    try (KafkaConsumer<Bytes, Bytes> consumer = createConsumer(cluster)) {
      final List<TopicPartition> topicPartitions = consumer.partitionsFor(topic).stream()
          .map(i -> new TopicPartition(i.topic(), i.partition()))
          .collect(Collectors.toList());
      return consumer.endOffsets(topicPartitions);
    }
  }

  public Map<TopicPartition, Long> topicPartitionsEndOffsets(
      KafkaCluster cluster, Collection<TopicPartition> topicPartitions) {
    try (KafkaConsumer<Bytes, Bytes> consumer = createConsumer(cluster)) {
      return consumer.endOffsets(topicPartitions);
    }
  }

  public KafkaConsumer<Bytes, Bytes> createConsumer(KafkaCluster cluster) {
    return createConsumer(cluster, Map.of());
  }

  public KafkaConsumer<Bytes, Bytes> createConsumer(KafkaCluster cluster,
                                                    Map<String, Object> properties) {
    Properties props = new Properties();
    props.putAll(cluster.getProperties());
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui-" + UUID.randomUUID().toString());
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.putAll(properties);

    return new KafkaConsumer<>(props);
  }

  @SneakyThrows
  public Mono<InternalTopic> updateTopic(KafkaCluster cluster, String topicName,
                                         TopicUpdate topicUpdate) {
    ConfigResource topicCr = new ConfigResource(ConfigResource.Type.TOPIC, topicName);
    return getOrCreateAdminClient(cluster)
        .flatMap(ac -> {
          if (ac.getSupportedFeatures()
              .contains(ExtendedAdminClient.SupportedFeature.INCREMENTAL_ALTER_CONFIGS)) {
            return incrementalAlterConfig(topicUpdate, topicCr, ac)
                .flatMap(c -> getUpdatedTopic(ac, topicName));
          } else {
            return alterConfig(topicUpdate, topicCr, ac)
                .flatMap(c -> getUpdatedTopic(ac, topicName));
          }
        });
  }

  private Mono<InternalTopic> getUpdatedTopic(ExtendedAdminClient ac, String topicName) {
    return getTopicsData(ac.getAdminClient())
        .map(s -> s.stream()
            .filter(t -> t.getName().equals(topicName)).findFirst().orElseThrow());
  }

  private Mono<String> incrementalAlterConfig(TopicUpdate topicUpdate, ConfigResource topicCr,
                                              ExtendedAdminClient ac) {
    List<AlterConfigOp> listOp = topicUpdate.getConfigs().entrySet().stream()
        .flatMap(cfg -> Stream.of(new AlterConfigOp(new ConfigEntry(cfg.getKey(), cfg.getValue()),
            AlterConfigOp.OpType.SET))).collect(Collectors.toList());
    return ClusterUtil.toMono(
        ac.getAdminClient().incrementalAlterConfigs(Collections.singletonMap(topicCr, listOp))
            .all(), topicCr.name());
  }

  @SuppressWarnings("deprecation")
  private Mono<String> alterConfig(TopicUpdate topicUpdate, ConfigResource topicCr,
                                   ExtendedAdminClient ac) {
    List<ConfigEntry> configEntries = topicUpdate.getConfigs().entrySet().stream()
        .flatMap(cfg -> Stream.of(new ConfigEntry(cfg.getKey(), cfg.getValue())))
        .collect(Collectors.toList());
    Config config = new Config(configEntries);
    Map<ConfigResource, Config> map = Collections.singletonMap(topicCr, config);
    return ClusterUtil.toMono(ac.getAdminClient().alterConfigs(map).all(), topicCr.name());
  }

  private InternalTopic mergeWithStats(InternalTopic topic,
                                       Map<String, LongSummaryStatistics> topics,
                                       Map<TopicPartition, LongSummaryStatistics> partitions) {
    final LongSummaryStatistics stats = topics.get(topic.getName());

    return topic.toBuilder()
        .segmentSize(stats.getSum())
        .segmentCount(stats.getCount())
        .partitions(
            topic.getPartitions().entrySet().stream().map(e ->
                Tuples.of(e.getKey(), mergeWithStats(topic.getName(), e.getValue(), partitions))
            ).collect(Collectors.toMap(
                Tuple2::getT1,
                Tuple2::getT2
            ))
        ).build();
  }

  private InternalPartition mergeWithStats(String topic, InternalPartition partition,
                                           Map<TopicPartition, LongSummaryStatistics> partitions) {
    final LongSummaryStatistics stats =
        partitions.get(new TopicPartition(topic, partition.getPartition()));
    return partition.toBuilder()
        .segmentSize(stats.getSum())
        .segmentCount(stats.getCount())
        .build();
  }

  private Mono<InternalSegmentSizeDto> updateSegmentMetrics(AdminClient ac,
                                                            InternalClusterMetrics clusterMetrics,
                                                            List<InternalTopic> internalTopics) {
    List<String> names =
        internalTopics.stream().map(InternalTopic::getName).collect(Collectors.toList());
    return ClusterUtil.toMono(ac.describeTopics(names).all()).flatMap(topic ->
        ClusterUtil.toMono(ac.describeCluster().nodes()).flatMap(nodes ->
            ClusterUtil.toMono(
                ac.describeLogDirs(nodes.stream().map(Node::id).collect(Collectors.toList())).all())
                .map(log -> {
                  final List<Tuple3<Integer, TopicPartition, Long>> topicPartitions =
                      log.entrySet().stream().flatMap(b ->
                          b.getValue().entrySet().stream().flatMap(topicMap ->
                              topicMap.getValue().replicaInfos.entrySet().stream()
                                  .map(e -> Tuples.of(b.getKey(), e.getKey(), e.getValue().size))
                          )
                      ).collect(Collectors.toList());

                  final Map<TopicPartition, LongSummaryStatistics> partitionStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              Tuple2::getT2,
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );

                  final Map<String, LongSummaryStatistics> topicStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              t -> t.getT2().topic(),
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );

                  final Map<Integer, LongSummaryStatistics> brokerStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              Tuple2::getT1,
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );


                  final LongSummaryStatistics summary =
                      topicPartitions.stream().collect(Collectors.summarizingLong(Tuple3::getT3));


                  final Map<String, InternalTopic> resultTopics = internalTopics.stream().map(e ->
                      Tuples.of(e.getName(), mergeWithStats(e, topicStats, partitionStats))
                  ).collect(Collectors.toMap(
                      Tuple2::getT1,
                      Tuple2::getT2
                  ));

                  final Map<Integer, InternalBrokerDiskUsage> resultBrokers =
                      brokerStats.entrySet().stream().map(e ->
                          Tuples.of(e.getKey(), InternalBrokerDiskUsage.builder()
                              .segmentSize(e.getValue().getSum())
                              .segmentCount(e.getValue().getCount())
                              .build()
                          )
                      ).collect(Collectors.toMap(
                          Tuple2::getT1,
                          Tuple2::getT2
                      ));

                  return InternalSegmentSizeDto.builder()
                      .clusterMetricsWithSegmentSize(
                          clusterMetrics.toBuilder()
                              .segmentSize(summary.getSum())
                              .segmentCount(summary.getCount())
                              .internalBrokerDiskUsage(resultBrokers)
                              .build()
                      )
                      .internalTopicWithSegmentSize(resultTopics).build();
                })
        )
    );
  }

  public List<Metric> getJmxMetric(String clusterName, Node node) {
    return clustersStorage.getClusterByName(clusterName)
        .filter(c -> c.getJmxPort() != null)
        .filter(c -> c.getJmxPort() > 0)
        .map(c -> jmxClusterUtil.getJmxMetrics(c.getJmxPort(), node.host()))
        .orElse(Collections.emptyList());
  }

  private Mono<InternalClusterMetrics> fillJmxMetrics(InternalClusterMetrics internalClusterMetrics,
                                                      String clusterName, AdminClient ac) {
    return fillBrokerMetrics(internalClusterMetrics, clusterName, ac)
        .map(this::calculateClusterMetrics);
  }

  private Mono<InternalClusterMetrics> fillBrokerMetrics(
      InternalClusterMetrics internalClusterMetrics, String clusterName, AdminClient ac) {
    return ClusterUtil.toMono(ac.describeCluster().nodes())
        .flatMapIterable(nodes -> nodes)
        .map(broker ->
            Map.of(broker.id(), InternalBrokerMetrics.builder()
                .metrics(getJmxMetric(clusterName, broker)).build())
        )
        .collectList()
        .map(s -> internalClusterMetrics.toBuilder()
            .internalBrokerMetrics(ClusterUtil.toSingleMap(s.stream())).build());
  }

  private InternalClusterMetrics calculateClusterMetrics(
      InternalClusterMetrics internalClusterMetrics) {
    final List<Metric> metrics = internalClusterMetrics.getInternalBrokerMetrics().values().stream()
        .flatMap(b -> b.getMetrics().stream())
        .collect(
            Collectors.groupingBy(
                Metric::getCanonicalName,
                Collectors.reducing(jmxClusterUtil::reduceJmxMetrics)
            )
        ).values().stream()
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());
    final InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder =
        internalClusterMetrics.toBuilder().metrics(metrics);
    metricsBuilder.bytesInPerSec(findTopicMetrics(
        metrics, JmxMetricsName.BytesInPerSec, JmxMetricsValueName.FiveMinuteRate
    ));
    metricsBuilder.bytesOutPerSec(findTopicMetrics(
        metrics, JmxMetricsName.BytesOutPerSec, JmxMetricsValueName.FiveMinuteRate
    ));
    return metricsBuilder.build();
  }

  private Map<String, BigDecimal> findTopicMetrics(List<Metric> metrics, JmxMetricsName metricsName,
                                                   JmxMetricsValueName valueName) {
    return metrics.stream().filter(m -> metricsName.name().equals(m.getName()))
        .filter(m -> m.getParams().containsKey("topic"))
        .filter(m -> m.getValue().containsKey(valueName.name()))
        .map(m -> Tuples.of(
            m.getParams().get("topic"),
            m.getValue().get(valueName.name())
        )).collect(Collectors.groupingBy(
            Tuple2::getT1,
            Collectors.reducing(BigDecimal.ZERO, Tuple2::getT2, BigDecimal::add)
        ));
  }

  public Map<Integer, InternalPartition> getTopicPartitions(KafkaCluster c, InternalTopic topic) {
    var tps = topic.getPartitions().values().stream()
        .map(t -> new TopicPartition(topic.getName(), t.getPartition()))
        .collect(Collectors.toList());
    Map<Integer, InternalPartition> partitions =
        topic.getPartitions().values().stream().collect(Collectors.toMap(
            InternalPartition::getPartition,
            tp -> tp
        ));

    try (var consumer = createConsumer(c)) {
      final Map<TopicPartition, Long> earliest = consumer.beginningOffsets(tps);
      final Map<TopicPartition, Long> latest = consumer.endOffsets(tps);

      return tps.stream()
          .map(tp -> partitions.get(tp.partition()).toBuilder()
              .offsetMin(Optional.ofNullable(earliest.get(tp)).orElse(0L))
              .offsetMax(Optional.ofNullable(latest.get(tp)).orElse(0L))
              .build()
          ).collect(Collectors.toMap(
              InternalPartition::getPartition,
              tp -> tp
          ));
    } catch (Exception e) {
      return Collections.emptyMap();
    }
  }

  public Mono<Void> deleteTopicMessages(KafkaCluster cluster, Map<TopicPartition, Long> offsets) {
    var records = offsets.entrySet().stream()
        .map(entry -> Map.entry(entry.getKey(), RecordsToDelete.beforeOffset(entry.getValue())))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    return getOrCreateAdminClient(cluster).map(ExtendedAdminClient::getAdminClient)
        .map(ac -> ac.deleteRecords(records)).then();
  }

  public Mono<RecordMetadata> sendMessage(KafkaCluster cluster, String topic,
                                          CreateTopicMessage msg) {
    RecordSerDe serde =
        deserializationService.getRecordDeserializerForCluster(cluster);

    Properties properties = new Properties();
    properties.putAll(cluster.getProperties());
    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    try (KafkaProducer<byte[], byte[]> producer = new KafkaProducer<>(properties)) {
      final ProducerRecord<byte[], byte[]> producerRecord = serde.serialize(topic,
          msg.getKey() != null ? msg.getKey().getBytes() : null,
          msg.getContent().toString().getBytes(),
          Optional.ofNullable(msg.getPartition())
      );

      CompletableFuture<RecordMetadata> cf = new CompletableFuture<>();
      producer.send(producerRecord, (metadata, exception) -> {
        if (exception != null) {
          cf.completeExceptionally(exception);
        } else {
          cf.complete(metadata);
        }
      });
      return Mono.fromFuture(cf);
    }
  }

  private Mono<InternalTopic> increaseTopicPartitions(AdminClient adminClient,
                                                      String topicName,
                                                      Map<String, NewPartitions> newPartitionsMap
  ) {
    return ClusterUtil.toMono(adminClient.createPartitions(newPartitionsMap).all(), topicName)
        .flatMap(topic -> getTopicsData(adminClient, Collections.singleton(topic)).next());
  }

  public Mono<InternalTopic> increaseTopicPartitions(
      KafkaCluster cluster,
      String topicName,
      PartitionsIncrease partitionsIncrease) {
    return getOrCreateAdminClient(cluster)
        .flatMap(ac -> {
          Integer actualCount = cluster.getTopics().get(topicName).getPartitionCount();
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
          return increaseTopicPartitions(ac.getAdminClient(), topicName, newPartitionsMap);
        });
  }

}
