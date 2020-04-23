package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

@Builder(toBuilder = true)
@Data
public class InternalBrokersMetrics {

    private Integer brokerCount;
    private Integer zooKeeperStatus;
    private Integer activeControllers;
    private Integer uncleanLeaderElectionCount;
    private Integer onlinePartitionCount;
    private Integer underReplicatedPartitionCount;
    private Integer offlinePartitionCount;
    private Integer inSyncReplicasCount;
    private Integer outOfSyncReplicasCount;

    public void increaseOnlinePartitionCount(Integer value) {
        this.onlinePartitionCount = this.onlinePartitionCount + value;
    }

    public void increaseOfflinePartitionCount(Integer value) {
        this.offlinePartitionCount = this.offlinePartitionCount + value;
    }

    public void increaseUnderReplicatedPartitionCount(Integer value) {
        this.underReplicatedPartitionCount = this.underReplicatedPartitionCount + value;
    }

    public void increaseInSyncReplicasCount(Integer value) {
        this.inSyncReplicasCount = this.inSyncReplicasCount + value;
    }

    public void increaseOutOfSyncReplicasCount(Integer value) {
        this.outOfSyncReplicasCount = this.outOfSyncReplicasCount + value;
    }
}
