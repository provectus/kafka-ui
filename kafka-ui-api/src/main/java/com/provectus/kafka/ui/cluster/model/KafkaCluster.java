package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;
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

    Map<String, String> metricsMap = new ConcurrentHashMap<>();
    List<Topic> topics = new ArrayList<>();
    private Map<String, TopicDetails> topicDetailsMap = new ConcurrentHashMap<>();

    MBeanServerConnection mBeanServerConnection;
    ZkClient zkClient;
    AdminClient adminClient;

    ServerStatus status = ServerStatus.OFFLINE;
    ServerStatus jmxStatus = ServerStatus.OFFLINE;
    ServerStatus zookeeperStatus = ServerStatus.OFFLINE;

    Exception lastKafkaException;
    Exception lastJmxException;
    Exception lastZookeeperException;

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

    public TopicDetails getTopicDetails(String key) {
        var topicDetails = topicDetailsMap.get(key);
        if(topicDetails == null) {
            topicDetailsMap.putIfAbsent(key, new TopicDetails());
            topicDetails = topicDetailsMap.get(key);
        }
        return topicDetails;
    }
}
