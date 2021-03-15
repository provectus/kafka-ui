package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Data
@Builder(toBuilder = true)
public class InternalClusterMetrics {
    private final int brokerCount;
    private final int topicCount;
    private final int activeControllers;
    private final int uncleanLeaderElectionCount;
    private final int onlinePartitionCount;
    private final int underReplicatedPartitionCount;
    private final int offlinePartitionCount;
    private final int inSyncReplicasCount;
    private final int outOfSyncReplicasCount;
    private final Map<String, BigDecimal> bytesInPerSec;
    private final Map<String, BigDecimal> bytesOutPerSec;
    private final long segmentCount;
    private final long segmentSize;
    private final Map<Integer, InternalBrokerDiskUsage> internalBrokerDiskUsage;
    private final Map<Integer, InternalBrokerMetrics> internalBrokerMetrics;
    private final List<Metric> metrics;
    private final int zooKeeperStatus;
}
