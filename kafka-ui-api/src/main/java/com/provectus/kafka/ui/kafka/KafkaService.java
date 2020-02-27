package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.*;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;

import static com.provectus.kafka.ui.kafka.KafkaConstants.*;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaService {

    @SneakyThrows
    @Async
    public void loadClusterMetrics(KafkaCluster kafkaCluster) {
        log.debug("Start getting Kafka metrics for cluster: " + kafkaCluster.getName());
        boolean isConnected = false;
        if (kafkaCluster.getAdminClient() != null) {
            isConnected = isAdminClientConnected(kafkaCluster);
        }
        if (kafkaCluster.getAdminClient() == null || !isConnected) {
            isConnected = createAdminClient(kafkaCluster);
        }

        if (!isConnected) {
            kafkaCluster.getCluster().setStatus(ServerStatus.OFFLINE);

            return;
        }

        kafkaCluster.getCluster().setId(kafkaCluster.getId());
        kafkaCluster.getCluster().setStatus(ServerStatus.ONLINE);
        loadMetrics(kafkaCluster);
        loadTopicsData(kafkaCluster);
    }


    @SneakyThrows
    public Mono<ResponseEntity<Topic>> createTopic(KafkaCluster cluster, Mono<TopicFormData> topicFormData) {
        return topicFormData.flatMap(
                topicData -> {
                    AdminClient adminClient = cluster.getAdminClient();
                    NewTopic newTopic = new NewTopic(topicData.getName(), topicData.getPartitions(), topicData.getReplicationFactor().shortValue());
                    newTopic.configs(topicData.getConfigs());

                    createTopic(adminClient, newTopic);

                    DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(Collections.singletonList(topicData.getName()));
                    Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
                    var entry = topicDescriptionFuturesMap.entrySet().iterator().next();
                    var topicDescription = getTopicDescription(entry);
                    if (topicDescription == null) return Mono.error(new RuntimeException("Can't find created topic"));

                    Topic topic = collectTopicData(cluster, topicDescription);
                    cluster.getTopics().add(topic);
                    return Mono.just(new ResponseEntity<>(topic, HttpStatus.CREATED));
                }
        );
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
    private void loadTopicsData(KafkaCluster kafkaCluster) {
        AdminClient adminClient = kafkaCluster.getAdminClient();
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        var topicListings = adminClient.listTopics(listTopicsOptions).names().get();
        kafkaCluster.getCluster().setTopicCount(topicListings.size());

        DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(topicListings);
        Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
        List<Topic> foundTopics = new ArrayList<>();
        resetMetrics(kafkaCluster);

        for (var entry : topicDescriptionFuturesMap.entrySet()) {
            var topicDescription = getTopicDescription(entry);
            if (topicDescription == null) continue;
            Topic topic = collectTopicData(kafkaCluster, topicDescription);
            foundTopics.add(topic);
        }
        kafkaCluster.setTopics(foundTopics);
    }

    private void resetMetrics(KafkaCluster kafkaCluster) {
        kafkaCluster.getBrokersMetrics().setOnlinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setOfflinePartitionCount(0);
        kafkaCluster.getBrokersMetrics().setUnderReplicatedPartitionCount(0);
    }

    private Topic collectTopicData(KafkaCluster kafkaCluster, TopicDescription topicDescription) {
        var topic = new Topic().clusterId(kafkaCluster.getId());
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
        topic.setPartitions(partitions);

        TopicDetails topicDetails = kafkaCluster.getTopicDetails(topicDescription.name());
        topicDetails.setReplicas(replicasCount);
        topicDetails.setPartitionCount(topicDescription.partitions().size());
        topicDetails.setInSyncReplicas(inSyncReplicasCount);
        topicDetails.setReplicationFactor(topicDescription.partitions().size() > 0
                ? topicDescription.partitions().get(0).replicas().size()
                : null);
        topicDetails.setUnderReplicatedPartitions(urpCount);

        loadTopicConfig(kafkaCluster, topicDescription.name());

        return topic;
    }

    private TopicDescription getTopicDescription(Map.Entry<String, KafkaFuture<TopicDescription>> entry) {
        try {
            return entry.getValue().get();
        } catch (Exception e) {
            log.error("Can't get topic with name: " + entry.getKey(), e);

            return null;
        }
    }

    private void loadMetrics(KafkaCluster kafkaCluster) throws InterruptedException, java.util.concurrent.ExecutionException {
        AdminClient adminClient = kafkaCluster.getAdminClient();
        int brokerCount = adminClient.describeCluster().nodes().get().size();
        kafkaCluster.getCluster().setBrokerCount(brokerCount);
        kafkaCluster.getBrokersMetrics().setBrokerCount(brokerCount);
        kafkaCluster.getBrokersMetrics().setActiveControllers(adminClient.describeCluster().controller().get() != null ? 1 : 0);

        for (Map.Entry<MetricName, ? extends Metric> metricNameEntry : adminClient.metrics().entrySet()) {
            if (metricNameEntry.getKey().name().equals(IN_BYTE_PER_SEC_METRIC)
                    && metricNameEntry.getKey().description().equals(IN_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                kafkaCluster.getCluster().setBytesInPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
            }
            if (metricNameEntry.getKey().name().equals(OUT_BYTE_PER_SEC_METRIC)
                    && metricNameEntry.getKey().description().equals(OUT_BYTE_PER_SEC_METRIC_DESCRIPTION)) {
                kafkaCluster.getCluster().setBytesOutPerSec((int) Math.round((double) metricNameEntry.getValue().metricValue()));
            }
        }
    }

    @SneakyThrows
    private void loadTopicConfig(KafkaCluster kafkaCluster, String topicName) {
        AdminClient adminClient = kafkaCluster.getAdminClient();

        Set<ConfigResource> resources = Collections.singleton(new ConfigResource(ConfigResource.Type.TOPIC, topicName));
        final Map<ConfigResource, Config> configs = adminClient.describeConfigs(resources).all().get();

        if (configs.isEmpty()) return;

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

        kafkaCluster.getTopicConfigsMap().put(topicName, topicConfigs);
    }

    @SneakyThrows
    private void createTopic(AdminClient adminClient, NewTopic newTopic) {
        adminClient.createTopics(Collections.singletonList(newTopic))
                .values()
                .values()
                .iterator()
                .next()
                .get();
    }
}
