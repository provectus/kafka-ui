package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

    @Mapping(target = "brokerCount", source = "metrics.brokerCount")
    @Mapping(target = "onlinePartitionCount", source = "metrics.onlinePartitionCount")
    @Mapping(target = "topicCount", source = "metrics.topicCount")
    @Mapping(target = "bytesInPerSec", source = "metrics.bytesInPerSec", qualifiedByName = "sumMetrics")
    @Mapping(target = "bytesOutPerSec", source = "metrics.bytesOutPerSec", qualifiedByName = "sumMetrics")
    Cluster toCluster(KafkaCluster cluster);

    KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);
    @Mapping(target = "diskUsage", source = "internalBrokerDiskUsage", qualifiedByName="mapDiskUsage")
    ClusterStats toClusterStats(InternalClusterMetrics metrics);
    @Mapping(target = "items", source = "metrics")
    ClusterMetrics toClusterMetrics(InternalClusterMetrics metrics);
    BrokerMetrics toBrokerMetrics(InternalBrokerMetrics metrics);
    Topic toTopic(InternalTopic topic);
    Partition toPartition(InternalPartition topic);
    TopicDetails toTopicDetails(InternalTopic topic);
    TopicConfig toTopicConfig(InternalTopicConfig topic);
    Replica toReplica(InternalReplica replica);

    default TopicDetails toTopicDetails(InternalTopic topic, InternalClusterMetrics metrics) {
        final TopicDetails result = toTopicDetails(topic);
        result.setBytesInPerSec(
                metrics.getBytesInPerSec().get(topic.getName())
        );
        result.setBytesOutPerSec(
                metrics.getBytesOutPerSec().get(topic.getName())
        );
        return result;
    }

     default List<Partition> map(Map<Integer, InternalPartition> map) {
         return map.values().stream().map(this::toPartition).collect(Collectors.toList());
     }

     default List<BrokerDiskUsage> mapDiskUsage(Map<Integer, InternalBrokerDiskUsage> brokers) {
         return brokers.entrySet().stream().map(e -> this.map(e.getKey(), e.getValue())).collect(Collectors.toList());
     }

     default BrokerDiskUsage map(Integer id, InternalBrokerDiskUsage internalBrokerDiskUsage) {
         final BrokerDiskUsage brokerDiskUsage = new BrokerDiskUsage();
         brokerDiskUsage.setBrokerId(id);
         brokerDiskUsage.segmentCount((int)internalBrokerDiskUsage.getSegmentCount());
         brokerDiskUsage.segmentSize(internalBrokerDiskUsage.getSegmentSize());
         return brokerDiskUsage;
     }

     default BigDecimal sumMetrics(Map<String, BigDecimal> metrics) {
         return metrics.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
     }

}
