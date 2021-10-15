package com.provectus.kafka.ui.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
//TODO rename to jmxBrokerMetrics
public class InternalBrokerMetrics {
  private final List<MetricDTO> metrics;
}
