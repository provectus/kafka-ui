package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder(toBuilder = true)
public class InternalBrokerMetrics {
    private final List<Metric> metrics;
}
