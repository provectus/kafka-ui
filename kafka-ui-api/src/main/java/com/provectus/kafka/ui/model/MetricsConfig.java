package com.provectus.kafka.ui.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class MetricsConfig {
  public static final String JMX_METRICS_TYPE = "JMX";
  public static final String PROMETHEUS_METRICS_TYPE = "PROMETHEUS";

  private final String type;
  private final Integer port;
  private final boolean ssl;
  private final String username;
  private final String password;
  private final String keystoreLocation;
  private final String keystorePassword;
}
