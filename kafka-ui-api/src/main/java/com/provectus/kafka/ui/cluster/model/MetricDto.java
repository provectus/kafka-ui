package com.provectus.kafka.ui.cluster.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MetricDto {
    private String name;
    private String type;
    private String valueType;
    private BigDecimal value;
}
