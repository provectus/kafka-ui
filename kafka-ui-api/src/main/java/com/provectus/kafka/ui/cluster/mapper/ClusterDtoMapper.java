package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.ClusterDto;
import com.provectus.kafka.ui.model.Cluster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ClusterDtoMapper {

    ClusterDtoMapper instance = Mappers.getMapper(ClusterDtoMapper.class);

    @Mapping(target = "name")
    @Mapping(target = "id")
    @Mapping(target = "defaultCluster")
    @Mapping(target = "status")
    @Mapping(target = "brokerCount")
    @Mapping(target = "onlinePartitionCount")
    @Mapping(target = "topicCount")
    @Mapping(target = "bytesInPerSec")
    @Mapping(target = "bytesOutPerSec")
    ClusterDto toClusterDto(Cluster cluster);

    @Mapping(target = "name")
    @Mapping(target = "id")
    @Mapping(target = "defaultCluster")
    @Mapping(target = "status")
    @Mapping(target = "brokerCount")
    @Mapping(target = "onlinePartitionCount")
    @Mapping(target = "topicCount")
    @Mapping(target = "bytesInPerSec")
    @Mapping(target = "bytesOutPerSec")
    Cluster toCluster(ClusterDto cluster);
}
