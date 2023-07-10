package com.provectus.kafka.ui.service.metrics.scrape.inferred;

import static io.prometheus.client.Collector.MetricFamilySamples;

import java.util.List;
import java.util.stream.Stream;

public class InferredMetrics {

  private final List<MetricFamilySamples> metrics;

  public static InferredMetrics empty() {
    return new InferredMetrics(List.of());
  }

  public InferredMetrics(List<MetricFamilySamples> metrics) {
    this.metrics = metrics;
  }

  public Stream<MetricFamilySamples> asStream() {
    return metrics.stream();
  }

}
