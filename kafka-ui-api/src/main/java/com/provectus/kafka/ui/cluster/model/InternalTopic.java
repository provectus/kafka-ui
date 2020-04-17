package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InternalTopic {
    private final String name;
    private final boolean internal;
    private final List<InternalPartition> partitions = null;

}
