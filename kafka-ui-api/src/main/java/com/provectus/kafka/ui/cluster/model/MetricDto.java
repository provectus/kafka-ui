package com.provectus.kafka.ui.cluster.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MetricDto {
    private String canonicalName;
    private String metricName;
    private BigDecimal value;
}
