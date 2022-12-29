package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.service.masking.DataMasking;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.util.PollingThrottler;
import com.provectus.kafka.ui.util.ReactiveFailover;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.function.Supplier;
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
  private final InternalKsqlServer ksqldbServer;
  private final Properties properties;
  private final boolean readOnly;
  private final boolean disableLogDirsCollection;
  private final MetricsConfig metricsConfig;
  private final DataMasking masking;
  private final Supplier<PollingThrottler> throttler;
  private final ReactiveFailover<KafkaSrClientApi> schemaRegistryClient;
  private final List<ConnectDTO> kafkaConnect;
  private final Map<String, ReactiveFailover<KafkaConnectClientApi>> connectsClients;
}
