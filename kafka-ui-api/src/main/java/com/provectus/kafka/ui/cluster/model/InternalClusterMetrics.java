package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

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
    //TODO: find way to fill
    private final int bytesInPerSec;
    private final int bytesOutPerSec;
    private final int segmentCount;
    //TODO: find way to fill
    private final long segmentSize;
    private final Map<Integer, InternalBrokerMetrics> internalBrokerMetrics;
    private final int zooKeeperStatus;
}
