package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.BrokersMetricsDto;
import com.provectus.kafka.ui.model.BrokersMetrics;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface BrokersMetricsMapper {

    BrokersMetricsMapper instance = Mappers.getMapper(BrokersMetricsMapper.class);

    @Mapping(target = "brokerCount")
    @Mapping(target = "zooKeeperStatus")
    @Mapping(target = "activeControllers")
    @Mapping(target = "uncleanLeaderElectionCount")
    @Mapping(target = "onlinePartitionCount")
    @Mapping(target = "underReplicatedPartitionCount")
    @Mapping(target = "offlinePartitionCount")
    @Mapping(target = "inSyncReplicasCount")
    @Mapping(target = "outOfSyncReplicasCount")
    BrokersMetricsDto toBrokersMetricsDto (BrokersMetrics brokersMetrics);

    @Mapping(target = "brokerCount")
    @Mapping(target = "zooKeeperStatus")
    @Mapping(target = "activeControllers")
    @Mapping(target = "uncleanLeaderElectionCount")
    @Mapping(target = "onlinePartitionCount")
    @Mapping(target = "underReplicatedPartitionCount")
    @Mapping(target = "offlinePartitionCount")
    @Mapping(target = "inSyncReplicasCount")
    @Mapping(target = "outOfSyncReplicasCount")
    BrokersMetrics toBrokersMetrics (BrokersMetricsDto brokersMetrics);
}
