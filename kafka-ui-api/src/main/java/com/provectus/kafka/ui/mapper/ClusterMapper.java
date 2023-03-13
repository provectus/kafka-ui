package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.BrokerConfigDTO;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.BrokerDiskUsageDTO;
import com.provectus.kafka.ui.model.BrokerMetricsDTO;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterFeature;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.ConfigSourceDTO;
import com.provectus.kafka.ui.model.ConfigSynonymDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.InternalBroker;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalClusterState;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaAclDTO;
import com.provectus.kafka.ui.model.MetricDTO;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.PartitionDTO;
import com.provectus.kafka.ui.model.ReplicaDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.service.masking.DataMasking;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.acl.AclPermissionType;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourceType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClusterMapper {

  ClusterDTO toCluster(InternalClusterState clusterState);

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

  BrokerDTO toBrokerDto(InternalBroker broker);

  TopicDetailsDTO toTopicDetails(InternalTopic topic);

  @Mapping(target = "isReadOnly", source = "readOnly")
  @Mapping(target = "isSensitive", source = "sensitive")
  TopicConfigDTO toTopicConfig(InternalTopicConfig topic);

  ReplicaDTO toReplica(InternalReplica replica);

  ConnectDTO toKafkaConnect(ClustersProperties.ConnectCluster connect);

  List<ClusterDTO.FeaturesEnum> toFeaturesEnum(List<ClusterFeature> features);

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

  static KafkaAclDTO.OperationEnum mapAclOperation(AclOperation operation) {
    return switch (operation) {
      case ALL -> KafkaAclDTO.OperationEnum.ALL;
      case READ -> KafkaAclDTO.OperationEnum.READ;
      case WRITE -> KafkaAclDTO.OperationEnum.WRITE;
      case CREATE -> KafkaAclDTO.OperationEnum.CREATE;
      case DELETE -> KafkaAclDTO.OperationEnum.DELETE;
      case ALTER -> KafkaAclDTO.OperationEnum.ALTER;
      case DESCRIBE -> KafkaAclDTO.OperationEnum.DESCRIBE;
      case CLUSTER_ACTION -> KafkaAclDTO.OperationEnum.CLUSTER_ACTION;
      case DESCRIBE_CONFIGS -> KafkaAclDTO.OperationEnum.DESCRIBE_CONFIGS;
      case ALTER_CONFIGS -> KafkaAclDTO.OperationEnum.ALTER_CONFIGS;
      case IDEMPOTENT_WRITE -> KafkaAclDTO.OperationEnum.IDEMPOTENT_WRITE;
      case CREATE_TOKENS -> KafkaAclDTO.OperationEnum.CREATE_TOKENS;
      case DESCRIBE_TOKENS -> KafkaAclDTO.OperationEnum.DESCRIBE_TOKENS;
      case ANY, UNKNOWN -> KafkaAclDTO.OperationEnum.UNKNOWN;
    };
  }

  static KafkaAclDTO.ResourceTypeEnum mapAclResourceType(ResourceType resourceType) {
    return switch (resourceType) {
      case CLUSTER -> KafkaAclDTO.ResourceTypeEnum.CLUSTER;
      case TOPIC -> KafkaAclDTO.ResourceTypeEnum.TOPIC;
      case GROUP -> KafkaAclDTO.ResourceTypeEnum.GROUP;
      case DELEGATION_TOKEN -> KafkaAclDTO.ResourceTypeEnum.DELEGATION_TOKEN;
      case TRANSACTIONAL_ID -> KafkaAclDTO.ResourceTypeEnum.TRANSACTIONAL_ID;
      case USER -> KafkaAclDTO.ResourceTypeEnum.USER;
      case ANY, UNKNOWN -> KafkaAclDTO.ResourceTypeEnum.UNKNOWN;
    };
  }

  static AclBinding toAclBinding(KafkaAclDTO dto) {
    return new AclBinding(
        new ResourcePattern(
            ResourceType.valueOf(dto.getResourceType().name()),
            dto.getResourceName(),
            PatternType.valueOf(dto.getNamePatternType().name())
        ),
        new AccessControlEntry(
            dto.getPrincipal(),
            dto.getHost(),
            AclOperation.valueOf(dto.getOperation().name()),
            AclPermissionType.valueOf(dto.getPermission().name())
        )
    );
  }

  static KafkaAclDTO toKafkaAclDto(AclBinding binding) {
    var pattern = binding.pattern();
    var filter = binding.toFilter().entryFilter();
    return new KafkaAclDTO()
        .resourceType(mapAclResourceType(pattern.resourceType()))
        .resourceName(pattern.name())
        .namePatternType(KafkaAclDTO.NamePatternTypeEnum.fromValue(pattern.patternType().name()))
        .principal(filter.principal())
        .host(filter.host())
        .operation(mapAclOperation(filter.operation()))
        .permission(KafkaAclDTO.PermissionEnum.fromValue(filter.permissionType().name()));
  }

}
