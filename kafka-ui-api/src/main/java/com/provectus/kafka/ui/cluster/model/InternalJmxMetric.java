package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalJmxMetric {

    private String name;
    private String type;
    private String topic;
    private String canonicalName;
}
