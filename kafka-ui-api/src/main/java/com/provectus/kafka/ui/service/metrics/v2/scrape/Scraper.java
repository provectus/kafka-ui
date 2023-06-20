package com.provectus.kafka.ui.service.metrics.v2.scrape;


import reactor.core.publisher.Mono;

public interface Scraper<T extends  ScrapedMetrics> {

  Mono<T> scrape();

}
