package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.zookeeper.ZookeeperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.logging.Level;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetricsUpdateService {

    private final KafkaService kafkaService;
    private final ZookeeperService zookeeperService;

    public void updateMetrics(KafkaCluster kafkaCluster) {
        Mono.just(true)
                .doOnNext(s -> {
                    log.debug("Start getting metrics for kafkaCluster: {}", kafkaCluster.getName());
                    kafkaService.loadClusterMetrics(kafkaCluster);
                }).doOnNext(s -> zookeeperService.checkZookeeperStatus(kafkaCluster)).subscribe();
    }
}
