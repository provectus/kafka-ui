package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder(toBuilder = true)
public class KafkaCluster {

    private final String name;
    private final int jmxPort;
    private final String bootstrapServers;
    private final String zookeeper;
    private final String schemaRegistry;
    private final String schemaNameTemplate;
    private final ServerStatus status;
    private final ServerStatus zookeeperStatus;
    private final InternalClusterMetrics metrics;
    private final Map<String, InternalTopic> topics;
    private final Throwable lastKafkaException;
    private final Throwable lastZookeeperException;
}
