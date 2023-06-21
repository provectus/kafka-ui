package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedClusterState;
import com.provectus.kafka.ui.service.metrics.v2.scrape.Scraper;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class InferredMetricsScraper implements Scraper<InferredMetrics> {

  private final Supplier<ScrapedClusterState> currentStateSupplier;
  private ScrapedClusterState prevState = null;

  @Override
  public synchronized Mono<InferredMetrics> scrape() {
    if (prevState == null) {
      prevState = currentStateSupplier.get();
      return Mono.empty();
    }
    var newState = currentStateSupplier.get();
    var inferred = infer(prevState, newState);
    prevState = newState;
    return Mono.just(inferred);
  }

  private static InferredMetrics infer(ScrapedClusterState prevState,
                                       ScrapedClusterState newState) {
    //TODO: impl
    return new InferredMetrics(List.of());
  }

}
