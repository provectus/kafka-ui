package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.BrokerConfigDTO;
import com.provectus.kafka.ui.model.BrokerDiskUsageDTO;
import com.provectus.kafka.ui.model.BrokerMetricsDTO;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.CompatibilityCheckResponseDTO;
import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.ConfigSourceDTO;
import com.provectus.kafka.ui.model.ConfigSynonymDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
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
import com.provectus.kafka.ui.model.PartitionDTO;
import com.provectus.kafka.ui.model.ReplicaDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityLevel;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

  @Mapping(target = "brokerCount", source = "metrics.brokerCount")
  @Mapping(target = "onlinePartitionCount", source = "metrics.onlinePartitionCount")
  @Mapping(target = "topicCount", source = "metrics.topicCount")
  @Mapping(target = "bytesInPerSec", source = "metrics.bytesInPerSec",
      qualifiedByName = "sumMetrics")
  @Mapping(target = "bytesOutPerSec", source = "metrics.bytesOutPerSec",
      qualifiedByName = "sumMetrics")
  ClusterDTO toCluster(KafkaCluster cluster);

  @Mapping(target = "protobufFile", source = "protobufFile", qualifiedByName = "resolvePath")
  @Mapping(target = "properties", source = "properties", qualifiedByName = "setProperties")
  @Mapping(target = "schemaRegistry", source = ".", qualifiedByName = "setSchemaRegistry")
  KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);

  @Mapping(target = "diskUsage", source = "internalBrokerDiskUsage",
      qualifiedByName = "mapDiskUsage")
  ClusterStatsDTO toClusterStats(InternalClusterMetrics metrics);

  @Mapping(target = "items", source = "metrics")
  ClusterMetricsDTO toClusterMetrics(InternalClusterMetrics metrics);

  BrokerMetricsDTO toBrokerMetrics(InternalBrokerMetrics metrics);

  @Mapping(target = "isSensitive", source = "sensitive")
  @Mapping(target = "isReadOnly", source = "readOnly")
  BrokerConfigDTO toBrokerConfig(InternalBrokerConfig config);

  default ConfigSynonymDTO toConfigSynonym(ConfigEntry.ConfigSynonym config) {
    if (config == null) {
      return null;
    }

    ConfigSynonymDTO configSynonym = new ConfigSynonymDTO();
    configSynonym.setName(config.name());
    configSynonym.setValue(config.value());
    if (config.source() != null) {
      configSynonym.setSource(ConfigSourceDTO.valueOf(config.source().name()));
    }

    return configSynonym;
  }

  TopicDTO toTopic(InternalTopic topic);

  PartitionDTO toPartition(InternalPartition topic);

  @Named("setSchemaRegistry")
  default InternalSchemaRegistry setSchemaRegistry(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties == null
        || clusterProperties.getSchemaRegistry() == null) {
      return null;
    }

    InternalSchemaRegistry.InternalSchemaRegistryBuilder internalSchemaRegistry =
        InternalSchemaRegistry.builder();

    internalSchemaRegistry.url(
        clusterProperties.getSchemaRegistry() != null
            ? Arrays.asList(clusterProperties.getSchemaRegistry().split(","))
            : Collections.emptyList()
    );

    if (clusterProperties.getSchemaRegistryAuth() != null) {
      internalSchemaRegistry.username(clusterProperties.getSchemaRegistryAuth().getUsername());
      internalSchemaRegistry.password(clusterProperties.getSchemaRegistryAuth().getPassword());
    }

    return internalSchemaRegistry.build();
  }

  TopicDetailsDTO toTopicDetails(InternalTopic topic);

  default TopicDetailsDTO toTopicDetails(InternalTopic topic, InternalClusterMetrics metrics) {
    final TopicDetailsDTO result = toTopicDetails(topic);
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
  TopicConfigDTO toTopicConfig(InternalTopicConfig topic);

  ReplicaDTO toReplica(InternalReplica replica);

  ConnectDTO toKafkaConnect(KafkaConnectCluster connect);

  List<ClusterDTO.FeaturesEnum> toFeaturesEnum(List<Feature> features);

  @Mapping(target = "isCompatible", source = "compatible")
  CompatibilityCheckResponseDTO toCompatibilityCheckResponse(InternalCompatibilityCheck dto);

  @Mapping(target = "compatibility", source = "compatibilityLevel")
  CompatibilityLevelDTO toCompatibilityLevel(InternalCompatibilityLevel dto);

  default List<PartitionDTO> map(Map<Integer, InternalPartition> map) {
    return map.values().stream().map(this::toPartition).collect(Collectors.toList());
  }

  default BrokerDiskUsageDTO map(Integer id, InternalBrokerDiskUsage internalBrokerDiskUsage) {
    final BrokerDiskUsageDTO brokerDiskUsage = new BrokerDiskUsageDTO();
    brokerDiskUsage.setBrokerId(id);
    brokerDiskUsage.segmentCount((int) internalBrokerDiskUsage.getSegmentCount());
    brokerDiskUsage.segmentSize(internalBrokerDiskUsage.getSegmentSize());
    return brokerDiskUsage;
  }

  @Named("mapDiskUsage")
  default List<BrokerDiskUsageDTO> mapDiskUsage(Map<Integer, InternalBrokerDiskUsage> brokers) {
    return brokers.entrySet().stream().map(e -> this.map(e.getKey(), e.getValue()))
        .collect(Collectors.toList());
  }

  @Named("sumMetrics")
  default BigDecimal sumMetrics(Map<String, BigDecimal> metrics) {
    if (metrics != null) {
      return metrics.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    } else {
      return BigDecimal.ZERO;
    }
  }

  @Named("resolvePath")
  default Path resolvePath(String path) {
    if (path != null) {
      return Path.of(path);
    } else {
      return null;
    }
  }

  @Named("setProperties")
  default Properties setProperties(Properties properties) {
    Properties copy = new Properties();
    if (properties != null) {
      copy.putAll(properties);
    }
    return copy;
  }

}
