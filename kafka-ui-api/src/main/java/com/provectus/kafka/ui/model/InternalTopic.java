package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalTopic {

  // from TopicDescription
  private final String name;
  private final boolean internal;
  private final int replicas;
  private final int partitionCount;
  private final int inSyncReplicas;
  private final int replicationFactor;
  private final int underReplicatedPartitions;
  private final Map<Integer, InternalPartition> partitions;

  // topic configs
  private final List<InternalTopicConfig> topicConfigs;
  private final CleanupPolicy cleanUpPolicy;

  // rates from jmx
  private final BigDecimal bytesInPerSec;
  private final BigDecimal bytesOutPerSec;

  // from log dir data
  private final long segmentSize;
  private final long segmentCount;

  public InternalTopic withSegmentStats(long segmentSize, long segmentCount) {
    return toBuilder().segmentSize(segmentSize).segmentCount(segmentCount).build();
  }

  public InternalTopic withIoRates(BigDecimal bytesInPerSec, BigDecimal bytesOutPerSec) {
    return toBuilder().bytesInPerSec(bytesInPerSec).bytesOutPerSec(bytesOutPerSec).build();
  }

}
