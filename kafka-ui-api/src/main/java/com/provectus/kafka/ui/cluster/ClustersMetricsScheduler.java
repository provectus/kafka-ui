package com.provectus.kafka.ui.cluster;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.service.MetricsUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class ClustersMetricsScheduler {

    private final ClustersStorage clustersStorage;

    private final MetricsUpdateService metricsUpdateService;

    @Scheduled(fixedRate = 30000)
    public void updateMetrics() {
        for (KafkaCluster kafkaCluster : clustersStorage.getKafkaClusters()) {
            metricsUpdateService.updateMetrics(kafkaCluster);
        }
    }
}
