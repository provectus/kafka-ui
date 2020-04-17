package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InternalReplica {
    private final Integer broker;
    private final boolean leader;
    private final boolean inSync;
}
