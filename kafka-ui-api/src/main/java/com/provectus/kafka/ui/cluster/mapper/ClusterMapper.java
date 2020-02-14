package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Cluster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface ClusterMapper {

    @Mapping(target = "brokerCount", ignore = true)
    @Mapping(target = "bytesInPerSec", ignore = true)
    @Mapping(target = "bytesOutPerSec", ignore = true)
    @Mapping(target = "defaultCluster", ignore = true)
    @Mapping(target = "onlinePartitionCount", ignore = true)
    @Mapping(target = "topicCount", ignore = true)
    Cluster toOpenApiCluster(KafkaCluster kafkaCluster);

    @Mapping(target = "metricsMap", ignore = true)
    @Mapping(target = "status", ignore = true)
    KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);
}
