package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Cluster;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClusterDtoMapper {

    KafkaCluster toInternalCluster(Cluster cluster);
    Cluster toClusterDto(KafkaCluster cluster);
}
