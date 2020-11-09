package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.Metric;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder(toBuilder = true)
public class InternalBrokerMetrics {
    private final List<Metric> metrics;
}
