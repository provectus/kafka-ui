package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.*;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Builder(toBuilder = true)
public class KafkaCluster {

    private final String id = "";
    private final String name;
    private final String jmxHost;
    private final String jmxPort;
    private final String bootstrapServers;
    private final String zookeeper;

    private final Cluster cluster;
    private final BrokersMetrics brokersMetrics;

    private List<Topic> topics = new ArrayList<>();
    private final Map<String, TopicDetails> topicDetailsMap = new ConcurrentHashMap<>();
    private Map<String, List<TopicConfig>> topicConfigsMap = new ConcurrentHashMap<>();
    private final ServerStatus zookeeperStatus = ServerStatus.OFFLINE;

    private final Throwable lastKafkaException;
    private final Throwable lastZookeeperException;

    public TopicDetails getOrCreateTopicDetails(String key) {
        var topicDetails = topicDetailsMap.get(key);
        if(topicDetails == null) {
            topicDetailsMap.putIfAbsent(key, new TopicDetails());
            topicDetails = topicDetailsMap.get(key);
        }
        return topicDetails;
    }
}
