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
  private final InternalSchemaRegistry schemaRegistry;
  private final InternalKsqlServer ksqldbServer;
  private final List<KafkaConnectCluster> kafkaConnect;
  private final String schemaNameTemplate;
  private final String keySchemaNameTemplate;
  private final Path protobufFile;
  private final String protobufMessageName;
  private final Map<String, String> protobufMessageNameByTopic;
  private final String protobufMessageNameForKey;
  private final Map<String, String> protobufMessageNameForKeyByTopic;
  private final Properties properties;
  private final boolean readOnly;
  private final boolean disableLogDirsCollection;
}
