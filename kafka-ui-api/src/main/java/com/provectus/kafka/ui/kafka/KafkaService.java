package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.MetricsConstants;
import com.provectus.kafka.ui.model.Partition;
import com.provectus.kafka.ui.model.Replica;
import com.provectus.kafka.ui.model.ServerStatus;
import com.provectus.kafka.ui.model.Topic;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.provectus.kafka.ui.cluster.model.MetricsConstants.CLUSTER_ID;

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
            kafkaCluster.setStatus(ServerStatus.OFFLINE);

            return;
        }

        kafkaCluster.setStatus(ServerStatus.ONLINE);
        loadMetrics(kafkaCluster);
        loadTopics(kafkaCluster);
        loadTopicsDetails(kafkaCluster);
    }

    private boolean createAdminClient(KafkaCluster kafkaCluster) {
        try {
            Properties properties = new Properties();
            properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
            properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
            kafkaCluster.setAdminClient(AdminClient.create(properties));

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastKafkaException(e);

            return false;
        }
    }

    private boolean isAdminClientConnected(KafkaCluster kafkaCluster) {
        try {
            kafkaCluster.getAdminClient().listTopics();

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastKafkaException(e);

            return false;
        }
    }

    private void loadTopicsDetails(KafkaCluster kafkaCluster) {

    }

    @SneakyThrows
    private void loadTopics(KafkaCluster kafkaCluster) {
        AdminClient adminClient = kafkaCluster.getAdminClient();
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        var topicListings = adminClient.listTopics(listTopicsOptions).names().get();

        DescribeTopicsResult topicDescriptionsWrapper = adminClient.describeTopics(topicListings);
        Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
        List<Topic> foundTopics = new ArrayList<>();
        String clusterId = kafkaCluster.getMetricsMap().get(CLUSTER_ID);

        for (var entry : topicDescriptionFuturesMap.entrySet()) {
            var topicDescription = getTopicDescription(entry);
            if (topicDescription == null) continue;

            var topic = new Topic();
            topic.setClusterId(clusterId);
            topic.setInternal(topicDescription.isInternal());
            topic.setName(topicDescription.name());
            List<Partition> partitions = new ArrayList<>();

            for (TopicPartitionInfo partition : topicDescription.partitions()) {
                var partitionDto = new Partition();
                partitionDto.setLeader(partition.leader().id());
                partitionDto.setPartition(partition.partition());
                List<Replica> replicas = new ArrayList<>();
                for (Node replicaNode : partition.replicas()) {
                    var replica = new Replica();
                    replica.setBroker(replicaNode.id());
                    replica.setLeader(partition.leader() != null && partition.leader().id() == replicaNode.id());
                    replica.setInSync(partition.isr().contains(replicaNode));
                    replicas.add(replica);
                }
                partitionDto.setReplicas(replicas);
                partitions.add(partitionDto);
            }

            topic.setPartitions(partitions);
            foundTopics.add(topic);
        }
        kafkaCluster.setTopics(foundTopics);


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
        kafkaCluster.putMetric(MetricsConstants.BROKERS_COUNT, String.valueOf(adminClient.describeCluster().nodes().get().size()));

        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(false);
        Set<String> topicNames = adminClient.listTopics(listTopicsOptions).names().get();
        kafkaCluster.putMetric(MetricsConstants.TOPIC_COUNT, String.valueOf(topicNames.size()));

        int partitionsNum = 0;
        DescribeTopicsResult describeTopicsResult = adminClient.describeTopics(topicNames);
        for (TopicDescription topicDescription : describeTopicsResult.all().get().values()) {
            partitionsNum += topicDescription.partitions().size();
        }
        kafkaCluster.putMetric(MetricsConstants.PARTITIONS_COUNT, String.valueOf(partitionsNum));
    }
}
