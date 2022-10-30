package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.service.masking.DataMasking;
import java.util.List;
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
  private final String bootstrapServers;
  private final InternalSchemaRegistry schemaRegistry;
  private final InternalKsqlServer ksqldbServer;
  private final List<KafkaConnectCluster> kafkaConnect;
  private final Properties properties;
  private final boolean readOnly;
  private final boolean disableLogDirsCollection;
  private final MetricsConfig metricsConfig;
  private final DataMasking masking;
}
