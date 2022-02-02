package com.provectus.kafka.ui.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

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

  // from log dir
  private final long segmentSize;
  private final long segmentCount;


}
