package com.provectus.kafka.ui.cluster.model;

import lombok.Data;

@Data
public class Metrics {

    private KafkaCluster kafkaCluster;

    private Integer bytesInPerSec;

    private Integer bytesOutPerSec;

    private Integer brokerCount;

    private Integer activeControllers;
}
