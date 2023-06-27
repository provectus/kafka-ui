package com.provectus.kafka.ui.model;

import static com.provectus.kafka.ui.config.ClustersProperties.*;

import com.provectus.kafka.ui.config.ClustersProperties;
import jakarta.annotation.Nullable;
import lombok.Builder;
import lombok.Data;
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


}
