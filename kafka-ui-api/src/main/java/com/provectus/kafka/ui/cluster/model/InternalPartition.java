package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder(toBuilder = true)
public class InternalPartition {
    private final int partition;
    private final Integer leader;
    private final List<InternalReplica> replicas;
    private final int inSyncReplicasCount;
    private final int replicasCount;
    private final long offsetMin;
    private final long offsetMax;
    private final long segmentSize;
    private final long segmentCount;
}
