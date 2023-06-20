package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import static io.prometheus.client.Collector.*;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedMetrics;
import java.util.stream.Stream;

public class InferredMetrics implements ScrapedMetrics {

  @Override
  public Stream<MetricFamilySamples> asStream() {
    return null;
  }

  public ScrapedClusterState clusterState() {
    //todo: impl
    return null;
  }

}
