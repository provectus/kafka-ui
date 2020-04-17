package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.ClusterWithId;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.Metrics;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.*;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

import static com.provectus.kafka.ui.kafka.KafkaConstants.*;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaService {

    @SneakyThrows
    public Mono<ClusterWithId> updateClusterMetrics(ClusterWithId clusterWithId) {
        var kafkaCluster = clusterWithId.getKafkaCluster();
        var isConnected = false;
        log.debug("Start getting metrics for kafkaCluster: {}", kafkaCluster.getName());
        if (kafkaCluster.getAdminClient() != null) {
            isConnected = isAdminClientConnected(kafkaCluster);
        }
        if (kafkaCluster.getAdminClient() == null || !isConnected) {
            isConnected = createAdminClient(kafkaCluster);
        }
        if (!isConnected) {
            kafkaCluster.getCluster().setStatus(ServerStatus.OFFLINE);
            return Mono.empty();
        }
        kafkaCluster.getCluster().setId(kafkaCluster.getId());
        kafkaCluster.getCluster().setStatus(ServerStatus.ONLINE);
        return loadMetrics(kafkaCluster).map(metrics -> {
            var clusterId = new ClusterWithId(metrics.getKafkaCluster().getName(), metrics.getKafkaCluster());
            var kafkaCluster1 = metrics.getKafkaCluster();
            kafkaCluster1.getCluster().setBytesInPerSec(metrics.getBytesInPerSec());
            kafkaCluster1.getCluster().setBytesOutPerSec(metrics.getBytesOutPerSec());
            return clusterId;
        }).flatMap(this::updateTopicsData);
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
                    DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(Collections.singletonList(topicData.getName()));
                    Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
                    var entry = topicDescriptionFuturesMap.entrySet().iterator().next();
                    var topicDescription = getTopicDescription(entry);
                    if (topicDescription == null) return Mono.error(new RuntimeException("Can't find created topic"));
                    return topicDescription;
                }).flatMap(td ->
                    collectTopicData(cluster, td))
                .map(topic -> {
                    cluster.getTopics().add(topic);
                    return topic;
                });
    }

    @SneakyThrows
    private String getClusterId(KafkaCluster kafkaCluster) {
        return kafkaCluster.getAdminClient().describeCluster().clusterId().get();
    }

    private boolean createAdminClient(KafkaCluster kafkaCluster) {
        try {
            Properties properties = new Properties();
            properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
            properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
            kafkaCluster.setAdminClient(AdminClient.create(properties));
            kafkaCluster.setId(getClusterId(kafkaCluster));
            kafkaCluster.getCluster().setId(kafkaCluster.getId());

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastKafkaException(e);

            return false;
        }
    }

    private boolean isAdminClientConnected(KafkaCluster kafkaCluster) {
        try {
            getClusterId(kafkaCluster);

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastKafkaException(e);

            return false;
        }
    }

    @SneakyThrows
    private Mono<ClusterWithId> updateTopicsData(ClusterWithId clusterWithId) {
        AdminClient adminClient = clusterWithId.getKafkaCluster().getAdminClient();
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        return ClusterUtil.toMono(adminClient.listTopics(listTopicsOptions).names())
            .map(tl -> {
                clusterWithId.getKafkaCluster().getCluster().setTopicCount(tl.size());
                DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(tl);
                Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
                resetMetrics(clusterWithId.getKafkaCluster());
                return topicDescriptionFuturesMap.entrySet();
            })
            .flatMapMany(Flux::fromIterable)
            .flatMap(s -> ClusterUtil.toMono(s.getValue()))
            .flatMap(e -> collectTopicData(clusterWithId.getKafkaCluster(), e))
            .collectList()
            .map(s -> {
                clusterWithId.getKafkaCluster().setTopics(s);
                return clusterWithId;
            });
    }

    private void resetMetrics(KafkaCluster kafkaCluster) {
        kafkaCluster.getBrokersMetrics().setOnlinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setOfflinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setUnderReplicatedPartitionCount(0);
        kafkaCluster.getBrokersMetrics().setInSyncReplicasCount(0);
        kafkaCluster.getBrokersMetrics().setOutOfSyncReplicasCount(0);
    }

    private Mono<Topic> collectTopicData(KafkaCluster kafkaCluster, TopicDescription topicDescription) {
        var topic = new Topic();
        topic.setInternal(topicDescription.isInternal());
        topic.setName(topicDescription.name());

        int inSyncReplicasCount = 0, replicasCount = 0;
        List<Partition> partitions = new ArrayList<>();

        int urpCount = 0;
        for (TopicPartitionInfo partition : topicDescription.partitions()) {
            var partitionDto = new Partition();
            partitionDto.setLeader(partition.leader().id());
            partitionDto.setPartition(partition.partition());
            List<Replica> replicas = new ArrayList<>();

            boolean isUrp = false;
            for (Node replicaNode : partition.replicas()) {
                var replica = new Replica();
                replica.setBroker(replicaNode.id());
                replica.setLeader(partition.leader() != null && partition.leader().id() == replicaNode.id());
                replica.setInSync(partition.isr().contains(replicaNode));
                if (!replica.getInSync()) {
                    isUrp = true;
                }
                replicas.add(replica);

                inSyncReplicasCount += partition.isr().size();
                replicasCount += partition.replicas().size();
            }
            if (isUrp) {
                urpCount++;
            }
            partitionDto.setReplicas(replicas);
            partitions.add(partitionDto);

            if (partition.leader() != null) {
                kafkaCluster.getBrokersMetrics().setOnlinePartitionCount(kafkaCluster.getBrokersMetrics().getOnlinePartitionCount() + 1);
            } else {
                kafkaCluster.getBrokersMetrics().setOfflinePartitionCount(kafkaCluster.getBrokersMetrics().getOfflinePartitionCount() + 1);
            }
        }

        kafkaCluster.getCluster().setOnlinePartitionCount(kafkaCluster.getBrokersMetrics().getOnlinePartitionCount());
        kafkaCluster.getBrokersMetrics().setUnderReplicatedPartitionCount(
                kafkaCluster.getBrokersMetrics().getUnderReplicatedPartitionCount() + urpCount);
        kafkaCluster.getBrokersMetrics().setInSyncReplicasCount(
                kafkaCluster.getBrokersMetrics().getInSyncReplicasCount() + inSyncReplicasCount);
        kafkaCluster.getBrokersMetrics().setOutOfSyncReplicasCount(
                kafkaCluster.getBrokersMetrics().getOutOfSyncReplicasCount() + (replicasCount - inSyncReplicasCount));

        topic.setPartitions(partitions);
        TopicDetails topicDetails = kafkaCluster.getOrCreateTopicDetails(topicDescription.name());
        topicDetails.setReplicas(replicasCount);
        topicDetails.setPartitionCount(topicDescription.partitions().size());
        topicDetails.setInSyncReplicas(inSyncReplicasCount);
        topicDetails.setReplicationFactor(topicDescription.partitions().size() > 0
                ? topicDescription.partitions().get(0).replicas().size()
                : null);
        topicDetails.setUnderReplicatedPartitions(urpCount);
        return loadTopicConfig(kafkaCluster, topic.getName()).map(l -> topic);
    }

    private Mono<TopicDescription> getTopicDescription(Map.Entry<String, KafkaFuture<TopicDescription>> entry) {
        return ClusterUtil.toMono(entry.getValue())
                    .onErrorResume(e -> {
                        log.error("Can't get topic with name: " + entry.getKey());
                        return Mono.empty();
                    });
    }

    private Mono<Metrics> loadMetrics(KafkaCluster kafkaCluster) {
        Metrics metrics = new Metrics();
        AdminClient adminClient = kafkaCluster.getAdminClient();
        metrics.setKafkaCluster(kafkaCluster);
        return ClusterUtil.toMono(adminClient.describeCluster().nodes()).flatMap(brokers -> {
            var brokerCount = brokers.size();
            kafkaCluster.getCluster().setBrokerCount(brokerCount);
            kafkaCluster.getBrokersMetrics().setBrokerCount(brokerCount);
            return ClusterUtil.toMono(adminClient.describeCluster().controller());
        }).map(c -> {
            kafkaCluster.getBrokersMetrics().setActiveControllers(c != null ? 1 : 0);
            for (Map.Entry<MetricName, ? extends Metric> metricNameEntry : adminClient.metrics().entrySet()) {
                if (metricNameEntry.getKey().name().equals(IN_BYTE_PER_SEC_METRIC)
                        && metricNameEntry.getKey().description().equals(IN_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                    metrics.setBytesOutPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                }
                if (metricNameEntry.getKey().name().equals(OUT_BYTE_PER_SEC_METRIC)
                        && metricNameEntry.getKey().description().equals(OUT_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                    metrics.setBytesOutPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
                }
            }
            return metrics;
        });
    }

    @SneakyThrows
    private Mono<List<TopicConfig>> loadTopicConfig(KafkaCluster kafkaCluster, String topicName) {
        AdminClient adminClient = kafkaCluster.getAdminClient();

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
