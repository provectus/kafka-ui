package com.provectus.kafka.ui.model;

import static com.provectus.kafka.ui.config.ClustersProperties.KeystoreConfig;
import static com.provectus.kafka.ui.config.ClustersProperties.TruststoreConfig;

import com.provectus.kafka.ui.config.ClustersProperties;
import jakarta.annotation.Nullable;
import java.util.Objects;
import java.util.Optional;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MetricsScrapeProperties {
  public static final String JMX_METRICS_TYPE = "JMX";
  public static final String PROMETHEUS_METRICS_TYPE = "PROMETHEUS";

  Integer port;
  boolean ssl;
  String username;
  String password;

  @Nullable
  KeystoreConfig keystoreConfig;

  @Nullable
  TruststoreConfig truststoreConfig;

  public static MetricsScrapeProperties create(ClustersProperties.Cluster cluster){
    var metrics = Objects.requireNonNull(cluster.getMetrics());
    return MetricsScrapeProperties.builder()
        .port(metrics.getPort())
        .ssl(Optional.ofNullable(metrics.getSsl()).orElse(false))
        .username(metrics.getUsername())
        .password(metrics.getPassword())
        .truststoreConfig(cluster.getSsl())
        .keystoreConfig(
            metrics.getKeystoreLocation() != null
                ? new KeystoreConfig(metrics.getKeystoreLocation(), metrics.getKeystorePassword())
                : null
        )
        .build();
  }

}
