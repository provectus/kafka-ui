package com.provectus.kafka.ui.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
@Slf4j
public class ClustersMetricsScheduler {

  private final ClustersStorage clustersStorage;

  private final MetricsService metricsService;

  @Scheduled(fixedRateString = "${kafka.update-metrics-rate-millis:30000}")
  public void updateMetrics() {
    Flux.fromIterable(clustersStorage.getKafkaClusters())
        .parallel()
        .runOn(Schedulers.parallel())
        .flatMap(cluster -> {
          log.debug("Start getting metrics for kafkaCluster: {}", cluster.getName());
          return metricsService.updateCache(cluster)
              .doOnSuccess(m -> log.debug("Metrics updated for cluster: {}", cluster.getName()));
        })
        .then()
        .block();
  }
}
