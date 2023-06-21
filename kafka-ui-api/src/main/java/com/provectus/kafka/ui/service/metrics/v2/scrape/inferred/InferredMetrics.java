package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import static io.prometheus.client.Collector.*;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedClusterState;
import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedMetrics;
import java.util.List;
import java.util.stream.Stream;

public class InferredMetrics implements ScrapedMetrics {

  private final List<MetricFamilySamples> metrics;

  public InferredMetrics(List<MetricFamilySamples> metrics) {
    this.metrics = metrics;
  }

  @Override
  public Stream<MetricFamilySamples> asStream() {
    return metrics.stream();
  }

}
