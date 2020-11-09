package com.provectus.kafka.ui.cluster.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@AllArgsConstructor
public class MetricDto {
    private String canonicalName;
    private String metricName;
    private Map<String,String> params;
    private BigDecimal value;
}
