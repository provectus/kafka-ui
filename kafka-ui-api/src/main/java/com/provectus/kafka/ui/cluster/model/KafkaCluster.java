package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder(toBuilder = true, builderClassName = "KafkaClusterBuilder")
public class KafkaCluster {

    private final String id = "";
    private final String name;
    private final String jmxHost;
    private final String jmxPort;
    private final String bootstrapServers;
    private final String zookeeper;

    private final Cluster cluster;
    private final BrokersMetrics brokersMetrics;

    private final List<Topic> topics;
    private final Map<String, TopicDetails> topicDetailsMap;
    private final Map<String, List<TopicConfig>> topicConfigsMap;
    private final ServerStatus zookeeperStatus;

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
