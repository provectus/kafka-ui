package com.provectus.kafka.ui.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Log4j2
public class ClustersMetricsScheduler {

    private final ClustersStorage clustersStorage;

    private final MetricsUpdateService metricsUpdateService;

    @Scheduled(fixedRate = 30000)
    public void updateMetrics() {
        Flux.fromIterable(clustersStorage.getKafkaClustersMap().entrySet())
                .subscribeOn(Schedulers.parallel())
                .map(Map.Entry::getValue)
                .flatMap(metricsUpdateService::updateMetrics)
                .doOnNext(s -> clustersStorage.setKafkaCluster(s.getName(), s))
                .subscribe();
    }
}
