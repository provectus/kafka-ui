package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.BrokerConfig;
import com.provectus.kafka.ui.model.BrokerDiskUsage;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.ClusterMetrics;
import com.provectus.kafka.ui.model.ClusterStats;
import com.provectus.kafka.ui.model.CompatibilityCheckResponse;
import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.ConfigSource;
import com.provectus.kafka.ui.model.ConfigSynonym;
import com.provectus.kafka.ui.model.Connect;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalBrokerMetrics;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import com.provectus.kafka.ui.model.Partition;
import com.provectus.kafka.ui.model.Replica;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityLevel;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

  @Mapping(target = "brokerCount", source = "metrics.brokerCount")
  @Mapping(target = "onlinePartitionCount", source = "metrics.onlinePartitionCount")
  @Mapping(target = "topicCount", source = "metrics.topicCount")
  @Mapping(target = "bytesInPerSec", source = "metrics.bytesInPerSec",
      qualifiedByName = "sumMetrics")
  @Mapping(target = "bytesOutPerSec", source = "metrics.bytesOutPerSec",
      qualifiedByName = "sumMetrics")
  Cluster toCluster(KafkaCluster cluster);

  @Mapping(target = "protobufFile", source = "protobufFile", qualifiedByName = "resolvePath")
  @Mapping(target = "properties", source = "properties", qualifiedByName = "setProperties")
  @Mapping(target = "schemaRegistry", source = ".", qualifiedByName = "setSchemaRegistry")
  KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);

  @Mapping(target = "diskUsage", source = "internalBrokerDiskUsage",
      qualifiedByName = "mapDiskUsage")
  ClusterStats toClusterStats(InternalClusterMetrics metrics);

  @Mapping(target = "items", source = "metrics")
  ClusterMetrics toClusterMetrics(InternalClusterMetrics metrics);

  BrokerMetrics toBrokerMetrics(InternalBrokerMetrics metrics);

  @Mapping(target = "isSensitive", source = "sensitive")
  @Mapping(target = "isReadOnly", source = "readOnly")
  BrokerConfig toBrokerConfig(InternalBrokerConfig config);

  default ConfigSynonym toConfigSynonym(ConfigEntry.ConfigSynonym config) {
    if (config == null) {
      return null;
    }

    ConfigSynonym configSynonym = new ConfigSynonym();
    configSynonym.setName(config.name());
    configSynonym.setValue(config.value());
    if (config.source() != null) {
      configSynonym.setSource(ConfigSource.valueOf(config.source().name()));
    }

    return configSynonym;
  }

  Topic toTopic(InternalTopic topic);

  Partition toPartition(InternalPartition topic);

  default InternalSchemaRegistry setSchemaRegistry(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties == null
        || clusterProperties.getSchemaRegistry() == null) {
      return null;
    }

    InternalSchemaRegistry.InternalSchemaRegistryBuilder internalSchemaRegistry =
        InternalSchemaRegistry.builder();

    internalSchemaRegistry.url(clusterProperties.getSchemaRegistry());

    if (clusterProperties.getSchemaRegistryAuth() != null) {
      internalSchemaRegistry.username(clusterProperties.getSchemaRegistryAuth().getUsername());
      internalSchemaRegistry.password(clusterProperties.getSchemaRegistryAuth().getPassword());
    }

    return internalSchemaRegistry.build();
  }

  TopicDetails toTopicDetails(InternalTopic topic);

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

  @Mapping(target = "isReadOnly", source = "readOnly")
  @Mapping(target = "isSensitive", source = "sensitive")
  TopicConfig toTopicConfig(InternalTopicConfig topic);

  Replica toReplica(InternalReplica replica);

  Connect toKafkaConnect(KafkaConnectCluster connect);

  List<Cluster.FeaturesEnum> toFeaturesEnum(List<Feature> features);

  @Mapping(target = "isCompatible", source = "compatible")
  CompatibilityCheckResponse toCompatibilityCheckResponse(InternalCompatibilityCheck dto);

  @Mapping(target = "compatibility", source = "compatibilityLevel")
  CompatibilityLevel toCompatibilityLevel(InternalCompatibilityLevel dto);

  default List<Partition> map(Map<Integer, InternalPartition> map) {
    return map.values().stream().map(this::toPartition).collect(Collectors.toList());
  }

  default BrokerDiskUsage map(Integer id, InternalBrokerDiskUsage internalBrokerDiskUsage) {
    final BrokerDiskUsage brokerDiskUsage = new BrokerDiskUsage();
    brokerDiskUsage.setBrokerId(id);
    brokerDiskUsage.segmentCount((int) internalBrokerDiskUsage.getSegmentCount());
    brokerDiskUsage.segmentSize(internalBrokerDiskUsage.getSegmentSize());
    return brokerDiskUsage;
  }

  default List<BrokerDiskUsage> mapDiskUsage(Map<Integer, InternalBrokerDiskUsage> brokers) {
    return brokers.entrySet().stream().map(e -> this.map(e.getKey(), e.getValue()))
        .collect(Collectors.toList());
  }

  default BigDecimal sumMetrics(Map<String, BigDecimal> metrics) {
    if (metrics != null) {
      return metrics.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    } else {
      return BigDecimal.ZERO;
    }
  }

  default Path resolvePath(String path) {
    if (path != null) {
      return Path.of(path);
    } else {
      return null;
    }
  }

  default Properties setProperties(Properties properties) {
    Properties copy = new Properties();
    if (properties != null) {
      copy.putAll(properties);
    }
    return copy;
  }

}
