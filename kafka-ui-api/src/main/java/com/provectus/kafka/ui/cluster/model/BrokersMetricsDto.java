package com.provectus.kafka.ui.cluster.model;

import lombok.Data;

@Data
public class BrokersMetricsDto {

    private Integer brokerCount;
    private Integer zooKeeperStatus;
    private Integer activeControllers;
    private Integer uncleanLeaderElectionCount;
    private Integer onlinePartitionCount;
    private Integer underReplicatedPartitionCount;
    private Integer offlinePartitionCount;
    private Integer inSyncReplicasCount;
    private Integer outOfSyncReplicasCount;
}
