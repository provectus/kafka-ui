package com.provectus.kafka.ui.model;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Value;


@Builder
@Value
public class Metrics {
  Map<String, BigDecimal> bytesInPerSec;
  Map<String, BigDecimal> bytesOutPerSec;
  Map<Integer, List<RawMetric>> perBrokerMetrics;

  public static Metrics empty() {
    return Metrics.builder()
        .bytesInPerSec(Map.of())
        .bytesOutPerSec(Map.of())
        .perBrokerMetrics(Map.of())
        .build();
  }

  public Stream<RawMetric> getSummarizedMetrics() {
    return perBrokerMetrics.values().stream()
        .flatMap(Collection::stream)
        .collect(toMap(RawMetric::identityKey, m -> m, (m1, m2) -> m1.copyWithValue(m1.value().add(m2.value()))))
        .values()
        .stream();
  }

}
