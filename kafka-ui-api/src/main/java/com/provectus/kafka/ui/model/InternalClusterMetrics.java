package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;


@Data
@Builder(toBuilder = true)
public class InternalClusterMetrics {

  //topic metrics
  private final int topicCount;
  private final int underReplicatedPartitionCount;
  private final int onlinePartitionCount;
  private final int offlinePartitionCount;
  private final int inSyncReplicasCount;
  private final int outOfSyncReplicasCount;
  private final int uncleanLeaderElectionCount; // not used

  private final int zooKeeperStatus;

  private final int brokerCount; //+
  private final int activeControllers; //+

  //desc log dir
  private final Map<Integer, InternalBrokerDiskUsage> internalBrokerDiskUsage; // +  updateSegmentMetrics
  private final long segmentCount; // +  updateSegmentMetrics
  private final long segmentSize; // +  updateSegmentMetrics

  // jmx+
  private final Map<String, BigDecimal> bytesInPerSec; //+
  private final Map<String, BigDecimal> bytesOutPerSec; //+
  private final Map<Integer, InternalBrokerMetrics> internalBrokerMetrics; //+
  private final List<MetricDTO> metrics; //+ calculateClusterMetrics

  private final String version;
}
