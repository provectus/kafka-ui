package com.provectus.kafka.ui.service.metrics.v2.scrape.prom;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedMetrics;
import com.provectus.kafka.ui.service.metrics.v2.scrape.Scraper;
import reactor.core.publisher.Mono;

public class PrometheusScraper implements Scraper<ScrapedMetrics> {

  @Override
  public Mono<ScrapedMetrics> scrape() {
    return null;
  }
}
