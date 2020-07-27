package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.cluster.model.InternalTopic;
import com.provectus.kafka.ui.cluster.model.InternalTopicConfig;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

    @Mapping(target = "brokerCount", source = "metrics.brokerCount")
    @Mapping(target = "onlinePartitionCount", source = "metrics.onlinePartitionCount")
    @Mapping(target = "topicCount", source = "metrics.topicCount")
    @Mapping(target = "metrics", source = "metrics.metrics")
    Cluster toCluster(KafkaCluster cluster);

    KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);
    BrokersMetrics toBrokerMetrics(InternalClusterMetrics metrics);
    Topic toTopic(InternalTopic topic);
    TopicDetails toTopicDetails(InternalTopic topic);
    TopicConfig toTopicConfig(InternalTopicConfig topic);
}
