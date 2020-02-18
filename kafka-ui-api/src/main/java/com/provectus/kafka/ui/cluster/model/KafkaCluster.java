package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ClusterStatus;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicDetails;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.I0Itec.zkclient.ZkClient;
import org.apache.kafka.clients.admin.AdminClient;

import javax.management.MBeanServerConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KafkaCluster {

    String name;
    String jmxHost;
    String jmxPort;
    String bootstrapServers;
    String zookeeper;
    ClusterStatus status = ClusterStatus.OFFLINE;

    Map<String, String> metricsMap = new ConcurrentHashMap<>();
    List<Topic> topics = new ArrayList<>();
    List<TopicDetails> topicDetails = new ArrayList<>();

    MBeanServerConnection mBeanServerConnection;
    ZkClient zkClient;
    AdminClient adminClient;

    Exception kafkaException;
    Exception jmxException;
    Exception zookeeperException;

    public void putMetric(String metricKey, String metricValue) {
        metricsMap.put(metricKey, metricValue);
    }

    public String getMetric(String metricKey) {
        return metricsMap.get(metricKey);
    }

    public String getMetricsMapAsString() {
        return metricsMap.keySet().stream()
                .map(key -> key + "=" + metricsMap.get(key))
                .collect(Collectors.joining(", ", "{", "}"));
    }
}
