package com.provectus.kafka.ui.service.metrics.v2.scrape;

import com.provectus.kafka.ui.model.Metrics;
import io.prometheus.client.Collector;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PerBrokerScrapedMetrics {

  @Getter
  private final Map<Integer, List<Collector.MetricFamilySamples>> perBrokerMetrics;

  public static PerBrokerScrapedMetrics empty() {
    return new PerBrokerScrapedMetrics(Map.of());
  }

  Metrics.IoRates ioRates() {
    //TODO: rename WKMetrics
    return new WellKnownMetrics(perBrokerMetrics).ioRates();
  }

}
