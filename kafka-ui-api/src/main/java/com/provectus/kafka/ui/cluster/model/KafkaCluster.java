package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.I0Itec.zkclient.ZkClient;
import org.apache.kafka.clients.admin.AdminClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KafkaCluster {

    String id = "";
    String name;
    String jmxHost;
    String jmxPort;
    String bootstrapServers;
    String zookeeper;

    Cluster cluster = new Cluster();
    BrokersMetrics brokersMetrics = new BrokersMetrics();

    List<Topic> topics = new ArrayList<>();
    private Map<String, TopicDetails> topicDetailsMap = new ConcurrentHashMap<>();
    private Map<String, List<TopicConfig>> topicConfigsMap = new ConcurrentHashMap<>();


    ZkClient zkClient;
    AdminClient adminClient;
    ServerStatus zookeeperStatus = ServerStatus.OFFLINE;

    Exception lastKafkaException;
    Exception lastZookeeperException;

    public TopicDetails getOrCreateTopicDetails(String key) {
        var topicDetails = topicDetailsMap.get(key);
        if(topicDetails == null) {
            topicDetailsMap.putIfAbsent(key, new TopicDetails());
            topicDetails = topicDetailsMap.get(key);
        }
        return topicDetails;
    }
}
