package com.provectus.kafka.ui.service.metrics.scrape;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.provectus.kafka.ui.model.Metrics;
import java.util.List;
import java.util.Map;

public record PerBrokerScrapedMetrics(Map<Integer, List<MetricFamilySamples>> perBrokerMetrics) {

  static PerBrokerScrapedMetrics empty() {
    return new PerBrokerScrapedMetrics(Map.of());
  }

  Metrics.IoRates ioRates() {
    return new IoRatesMetricsScanner(perBrokerMetrics).get();
  }

}
