package com.provectus.kafka.ui.model;

import static io.prometheus.client.Collector.*;
import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.service.metrics.RawMetric;
import com.provectus.kafka.ui.service.metrics.v2.scrape.inferred.InferredMetrics;
import io.prometheus.client.Collector;
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

  public static Metrics empty() {
    return Metrics.builder()
        .ioRates(null) //TODO: empty
        .perBrokerScrapedMetrics(Map.of())
        .inferredMetrics(InferredMetrics.empty())
        .build();
  }

  @Builder
  public record IoRates(Map<Integer, BigDecimal> brokerBytesInPerSec,
                        Map<Integer, BigDecimal> brokerBytesOutPerSec,
                        Map<String, BigDecimal> topicBytesInPerSec,
                        Map<String, BigDecimal> topicBytesOutPerSec) {
  }

  IoRates ioRates;
  InferredMetrics inferredMetrics;
  Map<Integer, List<MetricFamilySamples>> perBrokerScrapedMetrics;

  @Deprecated
  public Stream<RawMetric> getSummarizedMetrics() {
    return perBrokerScrapedMetrics
        .values()
        .stream()
        .flatMap(Collection::stream)
        .flatMap(RawMetric::create)
        .collect(toMap(RawMetric::identityKey, m -> m, (m1, m2) -> m1.copyWithValue(m1.value().add(m2.value()))))
        .values()
        .stream();
  }

}
