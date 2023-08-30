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
import com.provectus.kafka.ui.model.KafkaAclNamePatternTypeDTO;
import com.provectus.kafka.ui.model.KafkaAclResourceTypeDTO;
import com.provectus.kafka.ui.model.MetricDTO;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.PartitionDTO;
import com.provectus.kafka.ui.model.ReplicaDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.TopicProducerStateDTO;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.util.List;
import java.util.Map;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ProducerState;
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
        .items(metrics.getSummarizedMetrics().map(this::convert).toList());
  }

  private MetricDTO convert(RawMetric rawMetric) {
    return new MetricDTO()
        .name(rawMetric.name())
        .labels(rawMetric.labels())
        .value(rawMetric.value());
  }

  default BrokerMetricsDTO toBrokerMetrics(List<RawMetric> metrics) {
    return new BrokerMetricsDTO()
        .metrics(metrics.stream().map(this::convert).toList());
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
    return map.values().stream().map(this::toPartition).toList();
  }

  default BrokerDiskUsageDTO map(Integer id, InternalBrokerDiskUsage internalBrokerDiskUsage) {
    final BrokerDiskUsageDTO brokerDiskUsage = new BrokerDiskUsageDTO();
    brokerDiskUsage.setBrokerId(id);
    brokerDiskUsage.segmentCount((int) internalBrokerDiskUsage.getSegmentCount());
    brokerDiskUsage.segmentSize(internalBrokerDiskUsage.getSegmentSize());
    return brokerDiskUsage;
  }

  default TopicProducerStateDTO map(int partition, ProducerState state) {
    return new TopicProducerStateDTO()
        .partition(partition)
        .producerId(state.producerId())
        .producerEpoch(state.producerEpoch())
        .lastSequence(state.lastSequence())
        .lastTimestampMs(state.lastTimestamp())
        .coordinatorEpoch(state.coordinatorEpoch().stream().boxed().findAny().orElse(null))
        .currentTransactionStartOffset(state.currentTransactionStartOffset().stream().boxed().findAny().orElse(null));
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
      case ANY -> throw new IllegalArgumentException("ANY operation can be only part of filter");
      case UNKNOWN -> KafkaAclDTO.OperationEnum.UNKNOWN;
    };
  }

  static KafkaAclResourceTypeDTO mapAclResourceType(ResourceType resourceType) {
    return switch (resourceType) {
      case CLUSTER -> KafkaAclResourceTypeDTO.CLUSTER;
      case TOPIC -> KafkaAclResourceTypeDTO.TOPIC;
      case GROUP -> KafkaAclResourceTypeDTO.GROUP;
      case DELEGATION_TOKEN -> KafkaAclResourceTypeDTO.DELEGATION_TOKEN;
      case TRANSACTIONAL_ID -> KafkaAclResourceTypeDTO.TRANSACTIONAL_ID;
      case USER -> KafkaAclResourceTypeDTO.USER;
      case ANY -> throw new IllegalArgumentException("ANY type can be only part of filter");
      case UNKNOWN -> KafkaAclResourceTypeDTO.UNKNOWN;
    };
  }

  static ResourceType mapAclResourceTypeDto(KafkaAclResourceTypeDTO dto) {
    return ResourceType.valueOf(dto.name());
  }

  static PatternType mapPatternTypeDto(KafkaAclNamePatternTypeDTO dto) {
    return PatternType.valueOf(dto.name());
  }

  static AclBinding toAclBinding(KafkaAclDTO dto) {
    return new AclBinding(
        new ResourcePattern(
            mapAclResourceTypeDto(dto.getResourceType()),
            dto.getResourceName(),
            mapPatternTypeDto(dto.getNamePatternType())
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
        .namePatternType(KafkaAclNamePatternTypeDTO.fromValue(pattern.patternType().name()))
        .principal(filter.principal())
        .host(filter.host())
        .operation(mapAclOperation(filter.operation()))
        .permission(KafkaAclDTO.PermissionEnum.fromValue(filter.permissionType().name()));
  }

}
