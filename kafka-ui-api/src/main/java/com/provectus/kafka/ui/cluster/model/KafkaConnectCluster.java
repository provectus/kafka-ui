package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class KafkaConnectCluster {
    private final String name;
    private final String address;
}
