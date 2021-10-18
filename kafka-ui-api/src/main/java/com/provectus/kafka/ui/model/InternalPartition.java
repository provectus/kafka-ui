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

  // should be updated manually on partitions return
  private final long offsetMin;
  private final long offsetMax;

  // from log dir
  private final long segmentSize;
  private final long segmentCount;

  public InternalPartition withOffsets(long min, long max) {
    return toBuilder().offsetMin(min).offsetMax(max).build();
  }

  public InternalPartition withSegmentStats(long segmentSize, long segmentCount) {
    return toBuilder().segmentSize(segmentSize).segmentCount(segmentCount).build();
  }

}
