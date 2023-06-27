package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import com.provectus.kafka.ui.service.metrics.v2.scrape.ScrapedClusterState;
import java.util.List;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class InferredMetricsScraper {

  private ScrapedClusterState prevState = null;

  public synchronized Mono<InferredMetrics> scrape(ScrapedClusterState newState) {
    if (prevState == null) {
      prevState = newState;
      return Mono.just(InferredMetrics.empty());
    }
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
