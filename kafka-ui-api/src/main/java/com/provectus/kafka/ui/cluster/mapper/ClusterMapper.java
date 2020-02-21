package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public abstract class ClusterMapper {

    @Mapping(source = "name", target = "cluster.name")
    @Mapping(target = "brokersMetrics", ignore = true)
    @Mapping(target = "cluster", ignore = true)
    @Mapping(target = "lastKafkaException", ignore = true)
    @Mapping(target = "lastZookeeperException", ignore = true)
    @Mapping(target = "topicConfigsMap", ignore = true)
    @Mapping(target = "topicDetailsMap", ignore = true)
    @Mapping(target = "topics", ignore = true)
    @Mapping(target = "zkClient", ignore = true)
    @Mapping(target = "zookeeperStatus", ignore = true)
    @Mapping(target = "adminClient", ignore = true)
    public abstract KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);
}
