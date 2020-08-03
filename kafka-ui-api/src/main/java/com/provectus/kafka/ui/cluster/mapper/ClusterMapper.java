package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.*;
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
    ClusterMetrics toClusterMetrics(InternalClusterMetrics metrics);
    BrokerMetrics toBrokerMetrics(InternalBrokerMetrics metrics);
    Topic toTopic(InternalTopic topic);
    TopicDetails toTopicDetails(InternalTopic topic);
    TopicConfig toTopicConfig(InternalTopicConfig topic);
    Replica toReplica(InternalReplica replica);
}
