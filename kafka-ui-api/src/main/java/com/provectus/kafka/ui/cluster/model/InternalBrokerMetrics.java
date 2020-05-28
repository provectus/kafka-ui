package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalBrokerMetrics {
    private final Long segmentSize;
}
