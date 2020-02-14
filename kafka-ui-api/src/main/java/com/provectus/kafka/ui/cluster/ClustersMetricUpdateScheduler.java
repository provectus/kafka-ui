package com.provectus.kafka.ui.cluster;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.jmx.JmxService;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.ClusterStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class ClustersMetricUpdateScheduler {

    private final JmxService jmxService;
    private final KafkaService kafkaService;

    private final ClusterService clusterService;

    @Scheduled(fixedRate = 30000)
    public void updateMetrics() {
        for (KafkaCluster cluster : clusterService.getKafkaClusters()) {
            try {
                kafkaService.loadClusterMetrics(cluster);
                jmxService.loadClusterMetrics(cluster);
                cluster.setStatus(ClusterStatus.ONLINE);
            } catch (Exception e) {
                log.error(e);
                cluster.setStatus(ClusterStatus.OFFLINE);
            }
        }
    }
}
