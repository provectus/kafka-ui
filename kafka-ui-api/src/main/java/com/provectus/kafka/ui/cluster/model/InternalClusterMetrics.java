package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;
import lombok.Builder;
import lombok.Data;


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
    //TODO: find way to fill
    private final int segmentSize;
    private final int segmentCount;
    private final int zooKeeperStatus;
}
