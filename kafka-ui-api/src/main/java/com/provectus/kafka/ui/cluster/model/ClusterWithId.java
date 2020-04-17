package com.provectus.kafka.ui.cluster.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder(toBuilder = true)
public class ClusterWithId {
    private final String id;
    private final KafkaCluster kafkaCluster;
}
