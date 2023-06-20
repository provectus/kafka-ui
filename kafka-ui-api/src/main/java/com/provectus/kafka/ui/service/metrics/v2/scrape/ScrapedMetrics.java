package com.provectus.kafka.ui.service.metrics.v2.scrape;

import io.prometheus.client.Collector.MetricFamilySamples;
import java.util.Collection;

import java.util.stream.Stream;

public interface ScrapedMetrics {

  Stream<MetricFamilySamples> asStream();

  static ScrapedMetrics create(Collection<MetricFamilySamples> lst) {
    return lst::stream;
  }

}
