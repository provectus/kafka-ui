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
import com.provectus.kafka.ui.model.FailoverUrlList;
import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalClusterState;
import com.provectus.kafka.ui.model.InternalKsqlServer;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.PartitionDTO;
import com.provectus.kafka.ui.model.ReplicaDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityLevel;
import com.provectus.kafka.ui.service.metrics.RawMetric;
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

  ClusterDTO toCluster(InternalClusterState clusterState);

  @Mapping(target = "properties", source = "properties", qualifiedByName = "setProperties")
  @Mapping(target = "schemaRegistry", source = ".", qualifiedByName = "setSchemaRegistry")
  @Mapping(target = "ksqldbServer", source = ".", qualifiedByName = "setKsqldbServer")
  @Mapping(target = "metricsConfig", source = "metrics")
  KafkaCluster toKafkaCluster(ClustersProperties.Cluster clusterProperties);

  ClusterStatsDTO toClusterStats(InternalClusterState clusterState);

  default ClusterMetricsDTO toClusterMetrics(Metrics metrics) {
    return new ClusterMetricsDTO()
        .items(metrics.getSummarizedMetrics().map(this::convert).collect(Collectors.toList()));
  }

  private MetricDTO convert(RawMetric rawMetric) {
    return new MetricDTO()
        .name(rawMetric.name())
        .labels(rawMetric.labels())
        .value(rawMetric.value());
  }

  default BrokerMetricsDTO toBrokerMetrics(List<RawMetric> metrics) {
    return new BrokerMetricsDTO()
        .metrics(metrics.stream().map(this::convert).collect(Collectors.toList()));
  }

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
            ? new FailoverUrlList(Arrays.asList(clusterProperties.getSchemaRegistry().split(",")))
            : new FailoverUrlList(Collections.emptyList())
    );

    if (clusterProperties.getSchemaRegistryAuth() != null) {
      internalSchemaRegistry.username(clusterProperties.getSchemaRegistryAuth().getUsername());
      internalSchemaRegistry.password(clusterProperties.getSchemaRegistryAuth().getPassword());
    }

    if (clusterProperties.getSchemaRegistrySsl() != null) {
      internalSchemaRegistry.keystoreLocation(clusterProperties.getSchemaRegistrySsl().getKeystoreLocation());
      internalSchemaRegistry.keystorePassword(clusterProperties.getSchemaRegistrySsl().getKeystorePassword());
      internalSchemaRegistry.truststoreLocation(clusterProperties.getSchemaRegistrySsl().getTruststoreLocation());
      internalSchemaRegistry.truststorePassword(clusterProperties.getSchemaRegistrySsl().getTruststorePassword());
    }

    return internalSchemaRegistry.build();
  }

  @Named("setKsqldbServer")
  default InternalKsqlServer setKsqldbServer(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties == null
            || clusterProperties.getKsqldbServer() == null) {
      return null;
    }

    InternalKsqlServer.InternalKsqlServerBuilder internalKsqlServerBuilder =
            InternalKsqlServer.builder().url(clusterProperties.getKsqldbServer());

    if (clusterProperties.getKsqldbServerAuth() != null) {
      internalKsqlServerBuilder.username(clusterProperties.getKsqldbServerAuth().getUsername());
      internalKsqlServerBuilder.password(clusterProperties.getKsqldbServerAuth().getPassword());
    }

    return internalKsqlServerBuilder.build();
  }

  TopicDetailsDTO toTopicDetails(InternalTopic topic);

  @Mapping(target = "isReadOnly", source = "readOnly")
  @Mapping(target = "isSensitive", source = "sensitive")
  TopicConfigDTO toTopicConfig(InternalTopicConfig topic);

  ReplicaDTO toReplica(InternalReplica replica);

  ConnectDTO toKafkaConnect(KafkaConnectCluster connect);

  List<ClusterDTO.FeaturesEnum> toFeaturesEnum(List<Feature> features);

  @Mapping(target = "isCompatible", source = "compatible")
  CompatibilityCheckResponseDTO toCompatibilityCheckResponse(InternalCompatibilityCheck dto);

  @Mapping(target = "compatibility", source = "compatibilityLevel")
  CompatibilityLevelDTO toCompatibilityLevelDto(InternalCompatibilityLevel dto);

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

  @Named("setProperties")
  default Properties setProperties(Properties properties) {
    Properties copy = new Properties();
    if (properties != null) {
      copy.putAll(properties);
    }
    return copy;
  }

}
