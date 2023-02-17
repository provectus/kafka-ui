package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.client.RetryingKafkaConnectClient;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
import com.provectus.kafka.ui.service.masking.DataMasking;
import com.provectus.kafka.ui.sr.ApiClient;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.util.PollingThrottler;
import com.provectus.kafka.ui.util.ReactiveFailover;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaClusterFactory {

  @Value("${webclient.max-in-memory-buffer-size:20MB}")
  private DataSize maxBuffSize;

  public KafkaCluster create(ClustersProperties.Cluster clusterProperties) {
    KafkaCluster.KafkaClusterBuilder builder = KafkaCluster.builder();

    builder.name(clusterProperties.getName());
    builder.bootstrapServers(clusterProperties.getBootstrapServers());
    builder.properties(convertProperties(clusterProperties.getProperties()));
    builder.readOnly(clusterProperties.isReadOnly());
    builder.masking(DataMasking.create(clusterProperties.getMasking()));
    builder.metricsConfig(metricsConfigDataToMetricsConfig(clusterProperties.getMetrics()));
    builder.throttler(PollingThrottler.throttlerSupplier(clusterProperties));

    builder.schemaRegistryClient(schemaRegistryClient(clusterProperties));
    builder.connectsClients(connectClients(clusterProperties));
    builder.ksqlClient(ksqlClient(clusterProperties));

    builder.originalProperties(clusterProperties);

    return builder.build();
  }

  private Properties convertProperties(Map<String, Object> propertiesMap) {
    Properties properties = new Properties();
    if (propertiesMap != null) {
      properties.putAll(propertiesMap);
    }
    return properties;
  }

  @Nullable
  private Map<String, ReactiveFailover<KafkaConnectClientApi>> connectClients(
      ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getKafkaConnect() == null) {
      return null;
    }
    Map<String, ReactiveFailover<KafkaConnectClientApi>> connects = new HashMap<>();
    clusterProperties.getKafkaConnect().forEach(c -> {
      ReactiveFailover<KafkaConnectClientApi> failover = ReactiveFailover.create(
          parseUrlList(c.getAddress()),
          url -> new RetryingKafkaConnectClient(
              c.toBuilder().address(url).build(),
              clusterProperties.getSsl(),
              maxBuffSize
          ),
          ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
          "No alive connect instances available",
          ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
      );
      connects.put(c.getName(), failover);
    });
    return connects;
  }

  @Nullable
  private ReactiveFailover<KafkaSrClientApi> schemaRegistryClient(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getSchemaRegistry() == null) {
      return null;
    }
    var auth = Optional.ofNullable(clusterProperties.getSchemaRegistryAuth())
        .orElse(new ClustersProperties.SchemaRegistryAuth());
    WebClient webClient = new WebClientConfigurator()
        .configureSsl(clusterProperties.getSsl())
        .configureBasicAuth(auth.getUsername(), auth.getPassword())
        .configureBufferSize(maxBuffSize)
        .build();
    return ReactiveFailover.create(
        parseUrlList(clusterProperties.getSchemaRegistry()),
        url -> new KafkaSrClientApi(new ApiClient(webClient, null, null).setBasePath(url)),
        ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
        "No live schemaRegistry instances available",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  @Nullable
  private ReactiveFailover<KsqlApiClient> ksqlClient(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getKsqldbServer() == null) {
      return null;
    }
    return ReactiveFailover.create(
        parseUrlList(clusterProperties.getKsqldbServer()),
        url -> new KsqlApiClient(
            url,
            clusterProperties.getKsqldbServerAuth(),
            clusterProperties.getSsl(),
            maxBuffSize
        ),
        ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
        "No live ksqldb instances available",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  private List<String> parseUrlList(String url) {
    return Stream.of(url.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
  }

  @Nullable
  private MetricsConfig metricsConfigDataToMetricsConfig(ClustersProperties.MetricsConfigData metricsConfigData) {
    if (metricsConfigData == null) {
      return null;
    }
    MetricsConfig.MetricsConfigBuilder builder = MetricsConfig.builder();
    builder.type(metricsConfigData.getType());
    builder.port(metricsConfigData.getPort());
    builder.ssl(metricsConfigData.isSsl());
    builder.username(metricsConfigData.getUsername());
    builder.password(metricsConfigData.getPassword());
    return builder.build();
  }

}
