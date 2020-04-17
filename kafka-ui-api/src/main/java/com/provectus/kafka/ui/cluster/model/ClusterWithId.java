package com.provectus.kafka.ui.cluster.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClusterWithId {

    private String id;

    private KafkaCluster kafkaCluster;
}
