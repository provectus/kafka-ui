package com.provectus.kafka.ui.service.metrics.v2.scrape.jmx;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedMetrics;
import com.provectus.kafka.ui.service.metrics.v2.scrape.Scraper;
import reactor.core.publisher.Mono;

public class JmxMetricsScraper implements Scraper<ScrapedMetrics> {

  @Override
  public Mono<ScrapedMetrics> scrape() {
    return null;
  }
}
