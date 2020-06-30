package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.JmxMetric;
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
    private final int segmentCount;
    private final long segmentSize;
    private final Map<Integer, InternalBrokerMetrics> internalBrokerMetrics;
    private final List<JmxMetric> jmxMetrics;
    private final int zooKeeperStatus;
}
