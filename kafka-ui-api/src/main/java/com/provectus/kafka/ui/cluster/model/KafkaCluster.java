package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;

import java.util.List;
import java.util.Properties;
import lombok.Builder;
import lombok.Data;

import java.nio.file.Path;
import java.util.Map;

@Data
@Builder(toBuilder = true)
public class KafkaCluster {
    private final String name;
    private final Integer jmxPort;
    private final String bootstrapServers;
    private final String zookeeper;
    private final String schemaRegistry;
    private final List<KafkaConnectCluster> kafkaConnect;
    private final String schemaNameTemplate;
    private final ServerStatus status;
    private final ServerStatus zookeeperStatus;
    private final InternalClusterMetrics metrics;
    private final Map<String, InternalTopic> topics;
    private final Throwable lastKafkaException;
    private final Throwable lastZookeeperException;
    private final Path protobufFile;
    private final String protobufMessageName;
    private final Properties properties;
}
