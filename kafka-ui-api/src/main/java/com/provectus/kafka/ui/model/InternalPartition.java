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

  private final Long offsetMin;
  private final Long offsetMax;

  // from log dir
  private final Long segmentSize;
  private final Integer segmentCount;


}
