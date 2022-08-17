package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Value;


@Builder
@Value
public class Metrics {
  Map<String, BigDecimal> bytesInPerSec;
  Map<String, BigDecimal> bytesOutPerSec;
  Map<Integer, BrokerMetrics> internalBrokerMetrics;
  List<MetricDTO> metrics;

  public static Metrics empty() {
    return Metrics.builder()
        .bytesInPerSec(Map.of())
        .bytesOutPerSec(Map.of())
        .internalBrokerMetrics(Map.of())
        .metrics(List.of())
        .build();
  }
}
