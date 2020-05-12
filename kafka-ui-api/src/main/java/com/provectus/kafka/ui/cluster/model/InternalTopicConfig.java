package com.provectus.kafka.ui.cluster.model;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InternalTopicConfig {
    private final String name;
    private final String value;
    private final String defaultValue;
}
