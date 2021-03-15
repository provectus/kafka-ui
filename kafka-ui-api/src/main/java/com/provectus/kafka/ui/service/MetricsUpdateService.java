package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetricsUpdateService {

    private final KafkaService kafkaService;

    public Mono<KafkaCluster> updateMetrics(KafkaCluster kafkaCluster) {
        log.debug("Start getting metrics for kafkaCluster: {}", kafkaCluster.getName());
        return kafkaService.getUpdatedCluster(kafkaCluster);
    }
}
