package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.Metrics;
import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.model.*;
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

    private Map<String, AdminClient> adminClientCache = new ConcurrentHashMap<>();

    public Mono<ClusterWithId> getUpdatedCluster(ClusterWithId clusterWithId) {
        var kafkaCluster = clusterWithId.getKafkaCluster();
        return getOrCreateAdminClient(clusterWithId).flatMap(
                    ac ->
                        getClusterMetrics(ac, kafkaCluster).flatMap(
                                metrics -> {
                                    Cluster cluster = kafkaCluster.getCluster();
                                    cluster.setStatus(ServerStatus.ONLINE);
                                    cluster.setBytesInPerSec(metrics.getBytesInPerSec());
                                    cluster.setBytesOutPerSec(metrics.getBytesOutPerSec());
                                    BrokersMetrics brokersMetrics = kafkaCluster.getBrokersMetrics() == null ? new BrokersMetrics() : kafkaCluster.getBrokersMetrics();
                                    brokersMetrics.activeControllers(metrics.getActiveControllers());
                                    brokersMetrics.brokerCount(metrics.getBrokerCount());
                                    cluster.setBrokerCount(metrics.getBrokerCount());
                                    var internalCluster = kafkaCluster.toBuilder().cluster(cluster).brokersMetrics(brokersMetrics).build();
                                    return getTopicsData(ac, internalCluster)
                                            .map(topics -> {
                                                internalCluster.setTopics(ClusterUtil.convertToExternalTopicList(topics));
                                                internalCluster.getCluster().setTopicCount(topics.size());
                                                return internalCluster;
                                            }).map(kc -> clusterWithId.toBuilder().kafkaCluster(
                                                            kc.toBuilder()
                                                            .cluster(cluster)
                                                            .brokersMetrics(brokersMetrics)
                                                            .build()
                                            ).build());
                                })
            ).onErrorResume(
                    e -> {
                        Cluster cluster = kafkaCluster.getCluster();
                        cluster.setStatus(ServerStatus.OFFLINE);
                        return Mono.just(clusterWithId.toBuilder().kafkaCluster(
                                kafkaCluster.toBuilder()
                                        .lastKafkaException(e)
                                        .cluster(cluster)
                                        .build()
                        ).build());
                    }
            );
    }

    @SneakyThrows
    private Mono<List<InternalTopic>> getTopicsData(AdminClient adminClient, KafkaCluster kafkaCluster) {
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        return ClusterUtil.toMono(adminClient.listTopics(listTopicsOptions).names())
                    .map(tl -> {
                    kafkaCluster.getCluster().setTopicCount(tl.size());
                        DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(tl);
                        Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
                        resetMetrics(kafkaCluster);
                        return topicDescriptionFuturesMap.entrySet();
                    })
                    .flatMapMany(Flux::fromIterable)
                    .flatMap(s -> ClusterUtil.toMono(s.getValue()))
                    .flatMap(e -> collectTopicData(kafkaCluster, adminClient, e))
                    .collectList();
    }

    private Mono<Metrics> getClusterMetrics(AdminClient client, KafkaCluster kafkaCluster) {
        return ClusterUtil.toMono(client.describeCluster().nodes())
                .map(Collection::size)
                .flatMap(brokers ->
                    ClusterUtil.toMono(client.describeCluster().controller()).map(
                        c -> {
                            Metrics metrics = new Metrics();
                            metrics.setBrokerCount(brokers);
                            metrics.setActiveControllers(c != null ? 1 : 0);
                            for (Map.Entry<MetricName, ? extends Metric> metricNameEntry : client.metrics().entrySet()) {
                                if (metricNameEntry.getKey().name().equals(IN_BYTE_PER_SEC_METRIC)
                                        && metricNameEntry.getKey().description().equals(IN_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                                    metrics.setBytesInPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                                }
                                if (metricNameEntry.getKey().name().equals(OUT_BYTE_PER_SEC_METRIC)
                                        && metricNameEntry.getKey().description().equals(OUT_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                                    metrics.setBytesOutPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                                }
                            }
                            return metrics;
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
                    Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = tdw.values();
                    var entry = topicDescriptionFuturesMap.entrySet().iterator().next();
                    return getTopicDescription(entry);
                }).map(s -> {
                    if (s == null) {
                        throw new RuntimeException("Can't find created topic");
                    }
                return s;
                })
                .flatMap(td -> collectTopicData(cluster, adminClient, td))
            .map(topic -> {
                var resultTopic = ClusterUtil.convertToExternalTopic(topic);
                cluster.getTopics().add(resultTopic);
                return resultTopic;
            });
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

    private void resetMetrics(KafkaCluster kafkaCluster) {
        kafkaCluster.getBrokersMetrics().setOnlinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setOfflinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setUnderReplicatedPartitionCount(0);
        kafkaCluster.getBrokersMetrics().setInSyncReplicasCount(0);
        kafkaCluster.getBrokersMetrics().setOutOfSyncReplicasCount(0);
    }

    private Mono<InternalTopic> collectTopicData(KafkaCluster kafkaCluster, AdminClient adminClient, TopicDescription topicDescription) {
        var topic = InternalTopic.builder();
        topic.internal(topicDescription.isInternal());
        topic.name(topicDescription.name());
        List<InternalPartition> partitions = new ArrayList<>();
        List<InternalReplica> replicas = new ArrayList<>();
        int inSyncReplicasCount;
        int replicasCount;
        partitions.addAll(topicDescription.partitions().stream().map(
                partition -> {
                    var partitionDto = InternalPartition.builder();
                    partitionDto.leader(partition.leader().id());
                    partitionDto.partition(partition.partition());
                    partitionDto.inSyncReplicasCount(partition.isr().size());
                    partitionDto.replicasCount(partition.replicas().size());
                    replicas.addAll(partition.replicas().stream().map(
                            r -> new InternalReplica(r.id(), partition.leader().id()!=r.id(), partition.isr().contains(r)))
                            .collect(Collectors.toList()));
                    partitionDto.replicas(replicas);
                    return partitionDto.build();
                })
                .collect(Collectors.toList()));
        Integer urpCount = partitions.stream().flatMap(partition -> partition.getReplicas().stream()).filter(InternalReplica::isInSync).map(e -> 1).reduce(0, Integer::sum);
        inSyncReplicasCount = partitions.stream().flatMap(s -> Stream.of(s.getInSyncReplicasCount())).reduce(Integer::sum).orElseGet(() -> 0);
        replicasCount = partitions.stream().flatMap(s -> Stream.of(s.getReplicasCount())).reduce(Integer::sum).orElseGet(() -> 0);

        topic.partitions(partitions);

        var topicDetails = kafkaCluster.getOrCreateTopicDetails(topicDescription.name());

        topicDetails.setReplicas(replicasCount);
        topicDetails.setPartitionCount(topicDescription.partitions().size());
        topicDetails.setInSyncReplicas(inSyncReplicasCount);
        topicDetails.setReplicationFactor(topicDescription.partitions().size() > 0
                ? topicDescription.partitions().get(0).replicas().size()
                : null);
        topicDetails.setUnderReplicatedPartitions(urpCount);
        kafkaCluster.getCluster().setOnlinePartitionCount(kafkaCluster.getBrokersMetrics().getOnlinePartitionCount());
        kafkaCluster.getBrokersMetrics().setUnderReplicatedPartitionCount(
                kafkaCluster.getBrokersMetrics().getUnderReplicatedPartitionCount() + urpCount);
        kafkaCluster.getBrokersMetrics().setInSyncReplicasCount(
                kafkaCluster.getBrokersMetrics().getInSyncReplicasCount() + inSyncReplicasCount);
        kafkaCluster.getBrokersMetrics().setOutOfSyncReplicasCount(
                kafkaCluster.getBrokersMetrics().getOutOfSyncReplicasCount() + (replicasCount - inSyncReplicasCount));

        kafkaCluster.getBrokersMetrics().setOnlinePartitionCount(partitions.stream().filter(s -> s.getLeader() != null).map(e -> 1).reduce(0, Integer::sum));
        kafkaCluster.getBrokersMetrics().setOfflinePartitionCount(partitions.stream().filter(s -> s.getLeader() == null).map(e -> 1).reduce(0, Integer::sum));
        var resultTopic = topic.build();

        return loadTopicConfig(adminClient, kafkaCluster, resultTopic.getName()).map(l -> resultTopic);
    }

    private Mono<TopicDescription> getTopicDescription(Map.Entry<String, KafkaFuture<TopicDescription>> entry) {
        return ClusterUtil.toMono(entry.getValue())
                    .onErrorResume(e -> {
                        log.error("Can't get topic with name: " + entry.getKey());
                        return Mono.empty();
                    });
    }

    @SneakyThrows
    private Mono<List<TopicConfig>> loadTopicConfig(AdminClient adminClient, KafkaCluster kafkaCluster, String topicName) {
        Set<ConfigResource> resources = Collections.singleton(new ConfigResource(ConfigResource.Type.TOPIC, topicName));
        return ClusterUtil.toMono(adminClient.describeConfigs(resources).all())
                .map(configs -> {
                if (!configs.isEmpty()) return Collections.emptyList();
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

                    return kafkaCluster.getTopicConfigsMap().put(topicName, topicConfigs);
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
}
