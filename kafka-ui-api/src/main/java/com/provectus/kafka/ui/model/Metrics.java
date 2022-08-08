package com.provectus.kafka.ui.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Metrics {
  private final Integer port;
  private final MetricsType type;
  private final String username;
  private final String password;
  private final boolean sslEnabled;
  //private final String truststore;
  //private final String keystore; //TODO: Where are these used?

  public enum MetricsType {
    JMX,
    PROMETHEUS
  }
}
