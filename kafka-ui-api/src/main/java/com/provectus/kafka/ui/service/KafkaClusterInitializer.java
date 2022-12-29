package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.client.RetryingKafkaConnectClient;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.InternalKsqlServer;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import com.provectus.kafka.ui.service.masking.DataMasking;
import com.provectus.kafka.ui.sr.ApiClient;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.util.PollingThrottler;
import com.provectus.kafka.ui.util.ReactiveFailover;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClientRequestException;

@Service
@RequiredArgsConstructor
public class KafkaClusterInitializer {

  @Value("${webclient.max-in-memory-buffer-size:20MB}")
  private DataSize maxBuffSize;

  private final ClusterMapper clusterMapper;

  public KafkaCluster init(ClustersProperties.Cluster clusterProperties) {
    KafkaCluster.KafkaClusterBuilder kafkaCluster = KafkaCluster.builder();

    kafkaCluster.properties(Optional.ofNullable(clusterProperties.getProperties()).orElse(new Properties()));
    kafkaCluster.name(clusterProperties.getName());
    kafkaCluster.bootstrapServers(clusterProperties.getBootstrapServers());
    kafkaCluster.readOnly(clusterProperties.isReadOnly());
    kafkaCluster.disableLogDirsCollection(clusterProperties.isDisableLogDirsCollection());
    kafkaCluster.kafkaConnect(
        Optional.ofNullable(clusterProperties.getKafkaConnect()).orElse(List.of())
            .stream()
            .map(clusterMapper::toKafkaConnect)
            .toList()
    );

    kafkaCluster.masking(DataMasking.create(clusterProperties.getMasking()));
    kafkaCluster.metricsConfig(metricsConfigDataToMetricsConfig(clusterProperties.getMetrics()));
    kafkaCluster.throttler(PollingThrottler.throttlerSupplier(clusterProperties));

    kafkaCluster.schemaRegistryClient(schemaRegistryClient(clusterProperties));
    kafkaCluster.connectsClients(connectClients(clusterProperties));
    kafkaCluster.ksqldbServer(createKsqldbServer(clusterProperties));

    return kafkaCluster.build();
  }

  private Map<String, ReactiveFailover<KafkaConnectClientApi>> connectClients(
      ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getKafkaConnect() == null) {
      return null;
    }
    Map<String, ReactiveFailover<KafkaConnectClientApi>> connects = new HashMap<>();
    clusterProperties.getKafkaConnect().forEach(c -> {
      ReactiveFailover<KafkaConnectClientApi> failover = ReactiveFailover.create(
          Stream.of(c.getAddress().split(",")).map(String::trim).toList(),
          url -> new RetryingKafkaConnectClient(c.toBuilder().address(url).build(), maxBuffSize),
          ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
          "No alive connect instances available",
          Duration.ofSeconds(5)
      );
      connects.put(c.getName(), failover);
    });
    return connects;
  }

  private ReactiveFailover<KafkaSrClientApi> schemaRegistryClient(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getSchemaRegistry() == null) {
      return null;
    }
    return ReactiveFailover.create(
        Stream.of(clusterProperties.getSchemaRegistry().split(",")).map(String::trim).toList(),
        url -> {
          var auth = Optional.ofNullable(clusterProperties.getSchemaRegistryAuth())
              .orElse(new ClustersProperties.SchemaRegistryAuth());
          var webClient = new WebClientConfigurator()
              .configureSsl(clusterProperties.getSchemaRegistrySsl())
              .configureBasicAuth(auth.getUsername(), auth.getPassword())
              .build();
          return new KafkaSrClientApi(
              new ApiClient(webClient, null, null).setBasePath(url));
        },
        error -> error instanceof WebClientRequestException && error.getCause() instanceof IOException,
        "No live schemaRegistry instances found",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  private InternalKsqlServer createKsqldbServer(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties == null
        || clusterProperties.getKsqldbServer() == null) {
      return null;
    }

    InternalKsqlServer.InternalKsqlServerBuilder internalKsqlServerBuilder =
        InternalKsqlServer.builder().url(clusterProperties.getKsqldbServer());

    if (clusterProperties.getKsqldbServerAuth() != null) {
      internalKsqlServerBuilder.username(clusterProperties.getKsqldbServerAuth().getUsername());
      internalKsqlServerBuilder.password(clusterProperties.getKsqldbServerAuth().getPassword());
    }
    if (clusterProperties.getKsqldbServerSsl() != null) {
      internalKsqlServerBuilder.keystoreLocation(clusterProperties.getKsqldbServerSsl().getKeystoreLocation());
      internalKsqlServerBuilder.keystorePassword(clusterProperties.getKsqldbServerSsl().getKeystorePassword());
      internalKsqlServerBuilder.truststoreLocation(clusterProperties.getKsqldbServerSsl().getTruststoreLocation());
      internalKsqlServerBuilder.truststorePassword(clusterProperties.getKsqldbServerSsl().getTruststorePassword());
    }
    return internalKsqlServerBuilder.build();
  }

  private MetricsConfig metricsConfigDataToMetricsConfig(ClustersProperties.MetricsConfigData metricsConfigData) {
    if (metricsConfigData == null) {
      return null;
    }
    MetricsConfig.MetricsConfigBuilder metricsConfig = MetricsConfig.builder();
    metricsConfig.type(metricsConfigData.getType());
    metricsConfig.port(metricsConfigData.getPort());
    metricsConfig.ssl(metricsConfigData.isSsl());
    metricsConfig.username(metricsConfigData.getUsername());
    metricsConfig.password(metricsConfigData.getPassword());
    return metricsConfig.build();
  }


}
