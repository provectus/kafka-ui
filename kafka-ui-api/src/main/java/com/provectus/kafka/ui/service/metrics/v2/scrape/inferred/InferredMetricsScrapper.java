package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import com.provectus.kafka.ui.service.ReactiveAdminClient;
import com.provectus.kafka.ui.service.metrics.v2.scrape.Scraper;
import reactor.core.publisher.Mono;

public class InferredMetricsScrapper implements Scraper<InferredMetrics> {

  private final ReactiveAdminClient adminClient;

  private volatile ScrapedClusterState clusterState;

  public InferredMetricsScrapper(ReactiveAdminClient adminClient) {
    this.adminClient = adminClient;
  }

  @Override
  public Mono<InferredMetrics> scrape() {
    return null;
  }

}
