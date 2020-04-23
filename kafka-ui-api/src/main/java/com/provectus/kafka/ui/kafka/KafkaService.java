package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.mapper.BrokersMetricsMapper;
import com.provectus.kafka.ui.cluster.mapper.ClusterDtoMapper;
import com.provectus.kafka.ui.cluster.model.InternalMetrics;
import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.model.*;
import com.provectus.kafka.ui.zookeeper.ZookeeperService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Metric;
import org.apache.kafka.common.MetricName;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.kafka.KafkaConstants.*;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaService {

    private final ZookeeperService zookeeperService;

    private Map<String, AdminClient> adminClientCache = new ConcurrentHashMap<>();

    private final ClusterDtoMapper clusterDtoMapper;

    private final BrokersMetricsMapper brokersMetricsMapper;

    @SneakyThrows
    public Mono<ClusterWithId> getUpdatedCluster(ClusterWithId clusterWithId) {
        var internalCluster = clusterWithId.getKafkaCluster();
        return getOrCreateAdminClient(clusterWithId).flatMap(
                    ac ->
                        getClusterMetrics(ac).flatMap(
                                internalMetrics ->
                                    getTopicsData(ac)
                                        .flatMap(topics ->
                                            loadTopicConfig(ac, topics.stream().map(InternalTopic::getName).collect(Collectors.toList())).collectList()
                                                .map(s -> s.stream().collect(HashMap<String, List<TopicConfig>>::new, HashMap::putAll, HashMap::putAll))
                                                .map(s -> s.entrySet().stream().map(t -> InternalTopic.builder()
                                                            .name(t.getKey())
                                                            .topicConfigs(t.getValue())
                                                            .topicDetails(topics.stream().filter(to -> to.getName().equals(t.getKey())).findFirst().orElseThrow().getTopicDetails())
                                                            .partitions(topics.stream().filter(to -> to.getName().equals(t.getKey())).findFirst().orElseThrow().getPartitions())
                                                            .build()).collect(Collectors.toList()))
                                        ).map(topics -> {

                                            InternalBrokersMetrics brokersMetrics = internalCluster.getBrokersMetrics() != null
                                                    ? brokersMetricsMapper.toBrokersMetricsDto(internalCluster.getBrokersMetrics()) : InternalBrokersMetrics.builder().build();
                                            resetPartitionMetrics(brokersMetrics);
                                            brokersMetrics.setActiveControllers(internalMetrics.getActiveControllers());
                                            brokersMetrics.setZooKeeperStatus(zookeeperService.isZookeeperOnline(internalCluster) ? 1 : 0);
                                            brokersMetrics.setBrokerCount(internalMetrics.getBrokerCount());
                                            var internalBrokersMetrics = updateBrokersMetrics(brokersMetrics, topics);

                                            InternalCluster cluster = clusterDtoMapper.toClusterDto(internalCluster.getCluster());
                                            cluster.setStatus(ServerStatus.ONLINE);
                                            cluster.setBytesInPerSec(internalMetrics.getBytesInPerSec());
                                            cluster.setBytesOutPerSec(internalMetrics.getBytesOutPerSec());
                                            cluster.setBrokerCount(internalMetrics.getBrokerCount());
                                            cluster.setTopicCount(topics.size());
                                            cluster.setOnlinePartitionCount(internalBrokersMetrics.getOnlinePartitionCount());

                                            return ClusterWithId.builder()
                                                    .id(internalCluster.getName())
                                                    .kafkaCluster(
                                                        KafkaCluster.builder().topics(ClusterUtil.convertToExternalTopicList(topics))
                                                        .name(cluster.getName())
                                                        .zookeeperStatus(zookeeperService.isZookeeperOnline(internalCluster) ? ServerStatus.ONLINE : ServerStatus.OFFLINE)
                                                        .cluster(clusterDtoMapper.toCluster(cluster))
                                                        .brokersMetrics(brokersMetricsMapper.toBrokersMetrics(internalBrokersMetrics))
                                                        .build()
                                                    ).build();
                                            })
                                )
            ).onErrorResume(
                    e -> {
                        InternalCluster cluster = clusterDtoMapper.toClusterDto(internalCluster.getCluster());
                        cluster.setStatus(ServerStatus.OFFLINE);
                        return Mono.just(clusterWithId.toBuilder().kafkaCluster(
                                internalCluster.toBuilder()
                                .lastKafkaException(e)
                                .cluster(clusterDtoMapper.toCluster(cluster))
                                .build()
                        ).build());
                    }
            );
    }

    @SneakyThrows
    private Mono<List<InternalTopic>> getTopicsData(AdminClient adminClient) {
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        return ClusterUtil.toMono(adminClient.listTopics(listTopicsOptions).names())
                    .map(tl -> {
                        DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(tl);
                        Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
                        return topicDescriptionFuturesMap.entrySet();
                    })
                    .flatMapMany(Flux::fromIterable)
                    .flatMap(s -> ClusterUtil.toMono(s.getValue()))
                    .map(this::collectTopicData)
                    .collectList();
    }

    private Mono<InternalMetrics> getClusterMetrics(AdminClient client) {
        return ClusterUtil.toMono(client.describeCluster().nodes())
                .map(Collection::size)
                .flatMap(brokers ->
                    ClusterUtil.toMono(client.describeCluster().controller()).map(
                        c -> {
                            InternalMetrics internalMetrics = new InternalMetrics();
                            internalMetrics.setBrokerCount(brokers);
                            internalMetrics.setActiveControllers(c != null ? 1 : 0);
                            for (Map.Entry<MetricName, ? extends Metric> metricNameEntry : client.metrics().entrySet()) {
                                if (metricNameEntry.getKey().name().equals(IN_BYTE_PER_SEC_METRIC)
                                        && metricNameEntry.getKey().description().equals(IN_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                                    internalMetrics.setBytesInPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                                }
                                if (metricNameEntry.getKey().name().equals(OUT_BYTE_PER_SEC_METRIC)
                                        && metricNameEntry.getKey().description().equals(OUT_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                                    internalMetrics.setBytesOutPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                                }
                            }
                            return internalMetrics;
                        }
                    )
                );
    }


    @SneakyThrows
    public Mono<Topic> createTopic(AdminClient adminClient, KafkaCluster cluster, Mono<TopicFormData> topicFormData) {
        return topicFormData.flatMap(
                topicData -> {
                    NewTopic newTopic = new NewTopic(topicData.getName(), topicData.getPartitions(), topicData.getReplicationFactor().shortValue());
                    newTopic.configs(topicData.getConfigs());
                    createTopic(adminClient, newTopic);
                    return topicFormData;
                }).flatMap(topicData -> {
                    var tdw = adminClient.describeTopics(Collections.singletonList(topicData.getName()));
                    return getTopicDescription(tdw.values().get(topicData.getName()), topicData.getName());
                }).map(s -> {
                    if (s == null) {
                        throw new RuntimeException("Can't find created topic");
                    }
                return s;
                }).map(s -> getUpdatedCluster(new ClusterWithId(cluster.getName(), cluster)))
                .map(s -> new Topic());
    }

    @SneakyThrows
    private Mono<String> getClusterId(AdminClient adminClient) {
        return ClusterUtil.toMono(adminClient.describeCluster().clusterId());
    }


    public Mono<AdminClient> getOrCreateAdminClient(ClusterWithId clusterWithId) {
        AdminClient adminClient = adminClientCache.computeIfAbsent(
                clusterWithId.getId(),
                (id) -> createAdminClient(clusterWithId.getKafkaCluster())
        );

        return isAdminClientConnected(adminClient);
    }

    public AdminClient createAdminClient(KafkaCluster kafkaCluster) {
        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        return AdminClient.create(properties);
    }

    private Mono<AdminClient> isAdminClientConnected(AdminClient adminClient) {
        return getClusterId(adminClient).map( r -> adminClient);
    }

    private void resetPartitionMetrics(InternalBrokersMetrics brokersMetrics) {
        brokersMetrics.setOnlinePartitionCount(0);
        brokersMetrics.setOfflinePartitionCount(0);
        brokersMetrics.setUnderReplicatedPartitionCount(0);
        brokersMetrics.setInSyncReplicasCount(0);
        brokersMetrics.setOutOfSyncReplicasCount(0);
    }

    private InternalTopic collectTopicData(TopicDescription topicDescription) {
        TopicDetails topicDetails = new TopicDetails();
        var topic = InternalTopic.builder();
        topic.internal(topicDescription.isInternal());
        topic.name(topicDescription.name());
        List<InternalPartition> partitions = new ArrayList<>();

        int inSyncReplicasCount;
        int replicasCount;

        partitions.addAll(topicDescription.partitions().stream().map(
                partition -> {
                    var partitionDto = InternalPartition.builder();
                    partitionDto.leader(partition.leader().id());
                    partitionDto.partition(partition.partition());
                    partitionDto.inSyncReplicasCount(partition.isr().size());
                    partitionDto.replicasCount(partition.replicas().size());
                    List<InternalReplica> replicas = partition.replicas().stream().map(
                            r -> new InternalReplica(r.id(), partition.leader().id()!=r.id(), partition.isr().contains(r)))
                            .collect(Collectors.toList());
                    partitionDto.replicas(replicas);
                    return partitionDto.build();
                })
                .collect(Collectors.toList()));

        Integer urpCount = partitions.stream().flatMap(partition -> partition.getReplicas().stream()).filter(InternalReplica::isInSync).map(e -> 1).reduce(0, Integer::sum);
        inSyncReplicasCount = partitions.stream().flatMap(s -> Stream.of(s.getInSyncReplicasCount())).reduce(Integer::sum).orElseGet(() -> 0);
        replicasCount = partitions.stream().flatMap(s -> Stream.of(s.getReplicasCount())).reduce(Integer::sum).orElseGet(() -> 0);

        topic.partitions(partitions);

        topicDetails.setReplicas(replicasCount);
        topicDetails.setPartitionCount(topicDescription.partitions().size());
        topicDetails.setInSyncReplicas(inSyncReplicasCount);
        topicDetails.setReplicationFactor(topicDescription.partitions().size() > 0
                ? topicDescription.partitions().get(0).replicas().size()
                : null);
        topicDetails.setUnderReplicatedPartitions(urpCount);

        topic.topicDetails(topicDetails);

        return topic.build();
    }

    private Mono<TopicDescription> getTopicDescription(KafkaFuture<TopicDescription> entry, String topicName) {
        return ClusterUtil.toMono(entry)
                    .onErrorResume(e -> {
                        log.error("Can't get topic with name: " + topicName);
                        return Mono.empty();
                    });
    }

    @SneakyThrows
    private Flux<Map<String, List<TopicConfig>>> loadTopicConfig(AdminClient adminClient, List<String> topicNames) {
        return Flux.fromIterable(topicNames).flatMap(topicName -> {
            Set<ConfigResource> resources = Collections.singleton(new ConfigResource(ConfigResource.Type.TOPIC, topicName));
            return ClusterUtil.toMono(adminClient.describeConfigs(resources).all())
                    .map(configs -> {
                        if (configs.isEmpty()) return Collections.emptyMap();
                        Collection<ConfigEntry> entries = configs.values().iterator().next().entries();
                        List<TopicConfig> topicConfigs = new ArrayList<>();
                        for (ConfigEntry entry : entries) {
                            TopicConfig topicConfig = new TopicConfig();
                            topicConfig.setName(entry.name());
                            topicConfig.setValue(entry.value());
                            if (topicConfig.getName().equals(MESSAGE_FORMAT_VERSION_CONFIG)) {
                                topicConfig.setDefaultValue(topicConfig.getValue());
                            } else {
                                topicConfig.setDefaultValue(TOPIC_DEFAULT_CONFIGS.get(entry.name()));
                            }
                            topicConfigs.add(topicConfig);
                        }
                        return Collections.singletonMap(topicName, topicConfigs);
                    });
         });
    }

    @SneakyThrows
    private Mono<Void> createTopic(AdminClient adminClient, NewTopic newTopic) {
        return ClusterUtil.toMono(adminClient.createTopics(Collections.singletonList(newTopic))
                    .values()
                    .values()
                    .iterator()
                    .next());
    }

    private InternalBrokersMetrics updateBrokersMetrics(InternalBrokersMetrics brokersMetricsInput, List<InternalTopic> topics) {
        var tempBrokersMetrics = InternalBrokersMetrics.builder().build();
        var brokersMetrics = brokersMetricsInput.toBuilder();
        for (InternalTopic topic : topics) {
            tempBrokersMetrics.increaseUnderReplicatedPartitionCount(topic.getTopicDetails().getUnderReplicatedPartitions());
            tempBrokersMetrics.increaseInSyncReplicasCount(topic.getTopicDetails().getInSyncReplicas());
            tempBrokersMetrics.increaseOutOfSyncReplicasCount(topic.getTopicDetails().getReplicas() - topic.getTopicDetails().getInSyncReplicas());
            tempBrokersMetrics.increaseOnlinePartitionCount(topic.getPartitions().stream().filter(s -> s.getLeader() != null).map(e -> 1).reduce(0, Integer::sum));
            tempBrokersMetrics.increaseOfflinePartitionCount(topic.getPartitions().stream().filter(s -> s.getLeader() == null).map(e -> 1).reduce(0, Integer::sum));
        }
        return brokersMetrics.underReplicatedPartitionCount(tempBrokersMetrics.getUnderReplicatedPartitionCount())
                .inSyncReplicasCount(tempBrokersMetrics.getInSyncReplicasCount())
                .outOfSyncReplicasCount(tempBrokersMetrics.getOutOfSyncReplicasCount())
                .onlinePartitionCount(tempBrokersMetrics.getOnlinePartitionCount())
                .offlinePartitionCount(tempBrokersMetrics.getOfflinePartitionCount()).build();
    }
}
