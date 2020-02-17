package com.provectus.kafka.ui.kafka;

import com.provectus.kafka.ui.cluster.model.MetricsConstants;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.I0Itec.zkclient.ZkClient;
import org.apache.kafka.clients.admin.*;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.Set;

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
