package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClusterWithId;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.zookeeper.ZookeeperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetricsUpdateService {

    private final KafkaService kafkaService;
    private final ZookeeperService zookeeperService;

    public Mono<ClusterWithId> updateMetrics(ClusterWithId clusterWithId) {
        log.debug("Start getting metrics for kafkaCluster: {}", clusterWithId.getKafkaCluster());
        return kafkaService.updateClusterMetrics(clusterWithId)
                .map(s -> {
                    zookeeperService.checkZookeeperStatus(s.getKafkaCluster());
                    return s;
                });
    }
}
