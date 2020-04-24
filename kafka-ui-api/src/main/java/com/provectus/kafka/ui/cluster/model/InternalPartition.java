package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InternalPartition {
    private final int partition;
    private final Integer leader;
    private final List<InternalReplica> replicas;
    private final int inSyncReplicasCount;
    private final int replicasCount;
}
