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
public class ClustersStatisticsScheduler {

  private final ClustersStorage clustersStorage;

  private final StatisticsService statisticsService;

  @Scheduled(fixedRateString = "${kafka.update-metrics-rate-millis:30000}")
  public void updateStatistics() {
    Flux.fromIterable(clustersStorage.getKafkaClusters())
        .parallel()
        .runOn(Schedulers.parallel())
        .flatMap(cluster -> {
          log.debug("Start getting metrics for kafkaCluster: {}", cluster.getName());
          return statisticsService.updateCache(cluster)
              .doOnSuccess(m -> log.debug("Metrics updated for cluster: {}", cluster.getName()));
        })
        .then()
        .block();
  }
}
