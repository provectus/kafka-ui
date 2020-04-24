package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder(toBuilder = true)
public class KafkaCluster {

    private final String id = "";
    private final String name;
    private final String jmxHost;
    private final String jmxPort;
    private final String bootstrapServers;
    private final String zookeeper;
    private final ServerStatus status;
    private final ServerStatus zookeeperStatus;
    private final InternalClusterMetrics metrics;
    private final Map<String, InternalTopic> topics;
    private final Throwable lastKafkaException;
    private final Throwable lastZookeeperException;

}
