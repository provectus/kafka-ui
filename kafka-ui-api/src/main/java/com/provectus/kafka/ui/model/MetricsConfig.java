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

  private final String type = JMX_METRICS_TYPE;
  private final Integer port; //jmxPort, jmxExporterPort
  private final boolean ssl; //jmxssl
  private final String username; //jmxUsername
  private final String password; //jmxPassword

}
