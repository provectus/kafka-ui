package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.MetricsConstants;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Partition;
import com.provectus.kafka.ui.model.Replica;
import com.provectus.kafka.ui.model.Topic;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.I0Itec.zkclient.ZkClient;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.provectus.kafka.ui.cluster.model.MetricsConstants.CLUSTER_ID;
import static com.provectus.kafka.ui.cluster.model.MetricsConstants.ZOOKEEPER_STATUS;

@Service
@RequiredArgsConstructor
public class KafkaService {

    @SneakyThrows
    public void loadClusterMetrics(KafkaCluster kafkaCluster) {
        isZookeeperRunning(kafkaCluster);

        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        AdminClient adminClient = AdminClient.create(properties);

        loadMetrics(kafkaCluster, adminClient);
        loadTopics(kafkaCluster, adminClient);
        loadTopicsDetails(kafkaCluster, adminClient);
    }

    private void loadTopicsDetails(KafkaCluster kafkaCluster, AdminClient adminClient) {

    }

    @SneakyThrows
    private void loadTopics(KafkaCluster kafkaCluster, AdminClient adminClient) {
        ListTopicsOptions listTopicsOptions = new ListTopicsOptions();
        listTopicsOptions.listInternal(true);
        Collection<String> topicListings = adminClient.listTopics(listTopicsOptions).names().get();

        DescribeTopicsResult topicDescriptionsWrapper= adminClient.describeTopics(topicListings);
        Map<String, KafkaFuture<TopicDescription>> topicDescriptionFuturesMap = topicDescriptionsWrapper.values();
        List<Topic> foundTopics = new ArrayList<>();
        String clusterId = kafkaCluster.getMetricsMap().get(CLUSTER_ID);
        for (KafkaFuture<TopicDescription> value : topicDescriptionFuturesMap.values()) {
            TopicDescription topicDescription = value.get();
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

    private void loadMetrics(KafkaCluster kafkaCluster, AdminClient adminClient) throws InterruptedException, java.util.concurrent.ExecutionException {
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

    public static void isZookeeperRunning(KafkaCluster kafkaCluster){
        //Because kafka connector waits for 2 minutes with retries before telling that there is no connection
        //ZKClient is used to not wait 2 minutes for response. If there is no connection, exception will be thrown
        try {
            ZkClient zkClient = new ZkClient(kafkaCluster.getZookeeper(), 1000);
            kafkaCluster.putMetric(ZOOKEEPER_STATUS, "1");
            zkClient.close();
        } catch (Exception e) {
            kafkaCluster.putMetric(ZOOKEEPER_STATUS, "0");
            throw e;
        }
    }
}
