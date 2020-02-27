package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.zookeeper.ZookeeperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetricsUpdateService {

    private final KafkaService kafkaService;
    private final ZookeeperService zookeeperService;

    @Async
    public void updateMetrics(KafkaCluster kafkaCluster) {
        log.debug("Start getting metrics for kafkaCluster: " + kafkaCluster.getName());
        kafkaService.loadClusterMetrics(kafkaCluster);
        zookeeperService.checkZookeeperStatus(kafkaCluster);
    }
}
