package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.cluster.model.InternalTopic;
import com.provectus.kafka.ui.cluster.model.InternalTopicConfig;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ValueMapping;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

    KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);

    @Mapping(target = "brokerCount", source = "metrics.brokerCount")
    @Mapping(target = "onlinePartitionCount", source = "metrics.onlinePartitionCount")
    @Mapping(target = "topicCount", source = "metrics.topicCount")
    @Mapping(target = "bytesInPerSec", source = "metrics.bytesInPerSec")
    @Mapping(target = "bytesOutPerSec", source = "metrics.bytesOutPerSec")
    Cluster toCluster(KafkaCluster cluster);

    BrokersMetrics toBrokerMetrics(InternalClusterMetrics metrics);
    Topic toTopic(InternalTopic topic);
    TopicDetails toTopicDetails(InternalTopic topic);
    TopicConfig toTopicConfig(InternalTopicConfig topic);
}
