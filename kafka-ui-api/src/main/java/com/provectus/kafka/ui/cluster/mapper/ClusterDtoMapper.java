package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.InternalCluster;
import com.provectus.kafka.ui.model.Cluster;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClusterDtoMapper {

    InternalCluster toClusterDto(Cluster cluster);

    Cluster toCluster(InternalCluster cluster);
}
