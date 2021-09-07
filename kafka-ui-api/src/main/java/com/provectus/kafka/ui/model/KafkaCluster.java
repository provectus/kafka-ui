package com.provectus.kafka.ui.model;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class KafkaCluster {
  private final String name;
  private final String version;
  private final Integer jmxPort;
  private final boolean jmxSsl;
  private final String jmxUsername;
  private final String jmxPassword;
  private final String bootstrapServers;
  private final String zookeeper;
  private final InternalSchemaRegistry schemaRegistry;
  private final String ksqldbServer;
  private final List<KafkaConnectCluster> kafkaConnect;
  private final String schemaNameTemplate;
  private final String keySchemaNameTemplate;
  private final ServerStatus status;
  private final ServerStatus zookeeperStatus;
  private final InternalClusterMetrics metrics;
  private final Map<String, InternalTopic> topics;
  private final List<Integer> brokers;
  private final Throwable lastKafkaException;
  private final Throwable lastZookeeperException;
  private final Path protobufFile;
  private final Map<String, String> protobufMessageName;
  private final Properties properties;
  private final Boolean readOnly;
  private final Boolean disableLogDirsCollection;
  private final List<Feature> features;
}
