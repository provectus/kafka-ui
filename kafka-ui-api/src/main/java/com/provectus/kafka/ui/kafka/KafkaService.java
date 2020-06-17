package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.cluster.util.JmxClusterUtil;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ServerStatus;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicFormData;
import com.provectus.kafka.ui.zookeeper.ZookeeperService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaService {

    @Value("${kafka.admin-client-timeout}")
    private int clientTimeout;

    private static final ListTopicsOptions LIST_TOPICS_OPTIONS = new ListTopicsOptions().listInternal(true);

    private final ZookeeperService zookeeperService;
    private final Map<String, ExtendedAdminClient> adminClientCache = new ConcurrentHashMap<>();
    private final Map<AdminClient, Map<TopicPartition, Integer>> leadersCache = new ConcurrentHashMap<>();
    private final JmxClusterUtil jmxClusterUtil;

    @SneakyThrows
    public Mono<KafkaCluster> getUpdatedCluster(KafkaCluster cluster) {
        return getOrCreateAdminClient(cluster).flatMap(
                ac -> getClusterMetrics(cluster, ac.getAdminClient())

                        .flatMap( clusterMetrics ->
                            getTopicsData(ac.getAdminClient()).flatMap( topics ->
                                loadTopicsConfig(ac.getAdminClient(), topics.stream().map(InternalTopic::getName).collect(Collectors.toList()))
                                        .map( configs -> mergeWithConfigs(topics, configs))
                                    .flatMap(it -> updateSegmentMetrics(ac.getAdminClient(), clusterMetrics, it))
                            ).map( segmentSizeDto -> buildFromData(cluster, segmentSizeDto))
                        )
        ).onErrorResume(
                e -> Mono.just(cluster.toBuilder()
                        .status(ServerStatus.OFFLINE)
                        .lastKafkaException(e)
                        .build())
        );
    }

    private KafkaCluster buildFromData(KafkaCluster currentCluster, InternalSegmentSizeDto segmentSizeDto) {

        var topics = segmentSizeDto.getInternalTopicWithSegmentSize();
        var brokersMetrics = segmentSizeDto.getClusterMetricsWithSegmentSize();

        InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder = brokersMetrics.toBuilder();

        InternalClusterMetrics topicsMetrics = collectTopicsMetrics(topics);

        ServerStatus zookeeperStatus = ServerStatus.OFFLINE;
        Throwable zookeeperException = null;
        try {
            zookeeperStatus = zookeeperService.isZookeeperOnline(currentCluster) ? ServerStatus.ONLINE : ServerStatus.OFFLINE;
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

    private InternalClusterMetrics collectTopicsMetrics(Map<String,InternalTopic> topics) {

        int underReplicatedPartitions = 0;
        int inSyncReplicasCount = 0;
        int outOfSyncReplicasCount = 0;
        int onlinePartitionCount = 0;
        int offlinePartitionCount = 0;

        for (InternalTopic topic : topics.values()) {
            underReplicatedPartitions += topic.getUnderReplicatedPartitions();
            inSyncReplicasCount += topic.getInSyncReplicas();
            outOfSyncReplicasCount += (topic.getReplicas() - topic.getInSyncReplicas());
            onlinePartitionCount += topic.getPartitions().stream().mapToInt(s -> s.getLeader() == null ? 0 : 1).sum();
            offlinePartitionCount += topic.getPartitions().stream().mapToInt(s -> s.getLeader() != null ? 0 : 1).sum();
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

    private Map<String, InternalTopic> mergeWithConfigs(List<InternalTopic> topics, Map<String, List<InternalTopicConfig>> configs) {
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
                    .flatMap(topics -> ClusterUtil.toMono(adminClient.describeTopics(topics).all()))
                    .map(topic -> {
                        var leadersMap = topic.values().stream()
                            .flatMap(t -> t.partitions().stream()
                                    .flatMap(t1 -> {
                                        Map<TopicPartition, Integer> result = new HashMap<>();
                                        result.put(new TopicPartition(t.name(), t1.partition()), t1.leader().id());
                                        return Stream.of(result);
                                    }));
                        leadersCache.put(adminClient, ClusterUtil.toSingleMap(leadersMap));
                        return topic;
                    })
                    .map( m -> m.values().stream().map(ClusterUtil::mapToInternalTopic).collect(Collectors.toList()));
    }

    private Mono<InternalClusterMetrics> getClusterMetrics(KafkaCluster cluster, AdminClient client) {
        return ClusterUtil.toMono(client.describeCluster().nodes())
                .flatMap(brokers ->
                    ClusterUtil.toMono(client.describeCluster().controller()).map(
                        c -> {
                            InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder = InternalClusterMetrics.builder();
                            metricsBuilder.brokerCount(brokers.size()).activeControllers(c != null ? 1 : 0);
                            Map<String, BigDecimal> bytesInPerSec = jmxClusterUtil.getJmxTrafficMetrics(cluster.getJmxPort(), c.host(), JmxClusterUtil.BYTES_IN_PER_SEC);
                            Map<String, BigDecimal> bytesOutPerSec = jmxClusterUtil.getJmxTrafficMetrics(cluster.getJmxPort(), c.host(), JmxClusterUtil.BYTES_OUT_PER_SEC);
                            metricsBuilder
                                    .internalBrokerMetrics((brokers.stream().map(Node::id).collect(Collectors.toMap(k -> k, v -> InternalBrokerMetrics.builder().build()))))
                                    .bytesOutPerSec(bytesOutPerSec)
                                    .bytesInPerSec(bytesInPerSec);
                            return metricsBuilder.build();
                        }
                    )
                );
    }


    public Mono<InternalTopic> createTopic(KafkaCluster cluster, Mono<TopicFormData> topicFormData) {
        return getOrCreateAdminClient(cluster).flatMap(ac -> createTopic(ac.getAdminClient(), topicFormData));
    }

    @SneakyThrows
    public Mono<InternalTopic> createTopic(AdminClient adminClient, Mono<TopicFormData> topicFormData) {
        return topicFormData.flatMap(
                topicData -> {
                    NewTopic newTopic = new NewTopic(topicData.getName(), topicData.getPartitions(), topicData.getReplicationFactor().shortValue());
                    newTopic.configs(topicData.getConfigs());
                    return createTopic(adminClient, newTopic).map( v -> topicData);
                }).flatMap(topicData -> {
                    var tdw = adminClient.describeTopics(Collections.singletonList(topicData.getName()));
                    return getTopicDescription(tdw.values().get(topicData.getName()), topicData.getName());
                })
                .switchIfEmpty(Mono.error(new RuntimeException("Can't find created topic")))
                .map(ClusterUtil::mapToInternalTopic)
                .flatMap( t ->
                        loadTopicsConfig(adminClient, Collections.singletonList(t.getName()))
                                .map( c -> mergeWithConfigs(Collections.singletonList(t), c))
                                .map( m -> m.values().iterator().next())
                );
    }

    @SneakyThrows
    public Mono<ExtendedAdminClient> getOrCreateAdminClient(KafkaCluster cluster) {
        return Mono.justOrEmpty(adminClientCache.get(cluster.getName()))
                .switchIfEmpty(createAdminClient(cluster))
                .map(e -> adminClientCache.computeIfAbsent(cluster.getName(), key -> e));
    }

    public Mono<ExtendedAdminClient> createAdminClient(KafkaCluster kafkaCluster) {
        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
        AdminClient adminClient = AdminClient.create(properties);
        return ExtendedAdminClient.extendedAdminClient(adminClient);
    }



    private Mono<TopicDescription> getTopicDescription(KafkaFuture<TopicDescription> entry, String topicName) {
        return ClusterUtil.toMono(entry)
                    .onErrorResume(e -> {
                        log.error("Can't get topic with name: " + topicName);
                        return Mono.empty();
                    });
    }

    @SneakyThrows
    private Mono<Map<String, List<InternalTopicConfig>>> loadTopicsConfig(AdminClient adminClient, List<String> topicNames) {
        List<ConfigResource> resources = topicNames.stream()
                .map(topicName -> new ConfigResource(ConfigResource.Type.TOPIC, topicName))
                .collect(Collectors.toList());

        return ClusterUtil.toMono(adminClient.describeConfigs(resources).all())
                .map(configs ->
                        configs.entrySet().stream().map(
                                c -> Tuples.of(
                                        c.getKey().name(),
                                        c.getValue().entries().stream().map(ClusterUtil::mapToInternalTopicConfig).collect(Collectors.toList())
                                )
                        ).collect(Collectors.toMap(
                                Tuple2::getT1,
                                Tuple2::getT2
                        ))
                );
    }

    public Mono<List<ConsumerGroup>> getConsumerGroups(KafkaCluster cluster) {
        return getOrCreateAdminClient(cluster).flatMap(ac -> ClusterUtil.toMono(ac.getAdminClient().listConsumerGroups().all())
                .flatMap(s -> ClusterUtil.toMono(ac.getAdminClient()
                        .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all()))
                .map(s -> s.values().stream()
                        .map(c -> ClusterUtil.convertToConsumerGroup(c, cluster)).collect(Collectors.toList())));
    }

    public KafkaConsumer<Bytes, Bytes> createConsumer(KafkaCluster cluster) {
        Properties props = new Properties();
        props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui");
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);

        return new KafkaConsumer<>(props);
    }


    @SneakyThrows
    private Mono<String> createTopic(AdminClient adminClient, NewTopic newTopic) {
        return ClusterUtil.toMono(adminClient.createTopics(Collections.singletonList(newTopic)).all(), newTopic.name());
    }

    @SneakyThrows
    public Mono<Topic> updateTopic(KafkaCluster cluster, String topicName, TopicFormData topicFormData) {
        ConfigResource topicCR = new ConfigResource(ConfigResource.Type.TOPIC, topicName);
        return getOrCreateAdminClient(cluster)
                .flatMap(ac -> {
                    if (ac.getSupportedFeatures().contains(ExtendedAdminClient.SupportedFeature.INCREMENTAL_ALTER_CONFIGS)) {
                        return incrementalAlterConfig(topicFormData, topicCR, ac)
                                .flatMap(c -> getUpdatedTopic(ac, topicName));
                    } else {
                        return alterConfig(topicFormData, topicCR, ac)
                                .flatMap(c -> getUpdatedTopic(ac, topicName));
                    }
                });
    }



    private Mono<Topic> getUpdatedTopic (ExtendedAdminClient ac, String topicName) {
        return getTopicsData(ac.getAdminClient())
                .map(s -> s.stream()
                        .filter(t -> t.getName().equals(topicName)).findFirst().orElseThrow())
                .map(ClusterUtil::convertToTopic);
    }

    private Mono<String> incrementalAlterConfig(TopicFormData topicFormData, ConfigResource topicCR, ExtendedAdminClient ac) {
        List<AlterConfigOp> listOp = topicFormData.getConfigs().entrySet().stream()
                .flatMap(cfg -> Stream.of(new AlterConfigOp(new ConfigEntry(cfg.getKey(), cfg.getValue()), AlterConfigOp.OpType.SET))).collect(Collectors.toList());
        return ClusterUtil.toMono(ac.getAdminClient().incrementalAlterConfigs(Collections.singletonMap(topicCR, listOp)).all(), topicCR.name());
    }

    private Mono<String> alterConfig(TopicFormData topicFormData, ConfigResource topicCR, ExtendedAdminClient ac) {
        List<ConfigEntry> configEntries = topicFormData.getConfigs().entrySet().stream()
                .flatMap(cfg -> Stream.of(new ConfigEntry(cfg.getKey(), cfg.getValue()))).collect(Collectors.toList());
        Config config = new Config(configEntries);
        Map<ConfigResource, Config> map = Collections.singletonMap(topicCR, config);
        return ClusterUtil.toMono(ac.getAdminClient().alterConfigs(map).all(), topicCR.name());

    }

    private Mono<InternalSegmentSizeDto> updateSegmentMetrics(AdminClient ac, InternalClusterMetrics clusterMetrics, Map<String, InternalTopic> internalTopic) {
        return ClusterUtil.toMono(ac.describeTopics(internalTopic.keySet()).all()).flatMap(topic ->
            ClusterUtil.toMono(ac.describeLogDirs(clusterMetrics.getInternalBrokerMetrics().keySet()).all())
                .map(log -> {
                    var partitionSegmentSizeStream = leadersCache.get(ac).entrySet().stream()
                            .flatMap(l -> {
                                Map<TopicPartition, Long> result = new HashMap<>();
                                result.put(l.getKey(), log.get(l.getValue()).values().stream().mapToLong(e -> e.replicaInfos.get(l.getKey()).size).sum());
                                return Stream.of(result);
                            });
                    var partitionSegmentSize = ClusterUtil.toSingleMap(partitionSegmentSizeStream);

                    var resultTopicMetricsStream = internalTopic.keySet().stream().flatMap(k -> {
                        Map<String, InternalTopic> result = new HashMap<>();
                        result.put(k, internalTopic.get(k).toBuilder()
                                .segmentSize(partitionSegmentSize.entrySet().stream().filter(e -> e.getKey().topic().equals(k)).mapToLong(Map.Entry::getValue).sum())
                                .partitionSegmentSize(partitionSegmentSize.entrySet().stream().filter(e -> e.getKey().topic().equals(k)).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))).build());
                        return Stream.of(result);
                    });

                    var resultBrokerMetricsStream = clusterMetrics.getInternalBrokerMetrics().entrySet().stream().map(
                            e -> {
                                var brokerSegmentSize = log.get(e.getKey()).values().stream()
                                        .mapToLong(v -> v.replicaInfos.values().stream()
                                                .mapToLong(r -> r.size).sum()).sum();
                                InternalBrokerMetrics tempBrokerMetrics = InternalBrokerMetrics.builder().segmentSize(brokerSegmentSize).build();
                                return Collections.singletonMap(e.getKey(), tempBrokerMetrics);
                            });

                    var resultClusterMetrics = clusterMetrics.toBuilder()
                            .internalBrokerMetrics(ClusterUtil.toSingleMap(resultBrokerMetricsStream))
                            .segmentSize(partitionSegmentSize.values().stream().reduce(Long::sum).orElseThrow())
                            .build();

                    return InternalSegmentSizeDto.builder()
                            .clusterMetricsWithSegmentSize(resultClusterMetrics)
                            .internalTopicWithSegmentSize(ClusterUtil.toSingleMap(resultTopicMetricsStream)).build();
                })
            );
    }
}
