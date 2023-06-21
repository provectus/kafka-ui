package com.provectus.kafka.ui.service.metrics.v2.scrape;

import io.prometheus.client.Collector.MetricFamilySamples;
import java.util.Collection;

import java.util.List;
import java.util.stream.Stream;

public interface ScrapedMetrics {

  static ScrapedMetrics create(Collection<MetricFamilySamples> lst) {
    return lst::stream;
  }

  static ScrapedMetrics empty() {
    return create(List.of());
  }

  Stream<MetricFamilySamples> asStream();

}
