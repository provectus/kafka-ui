package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.util.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerTopicPartitionDetail;
import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalReplica;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.ServerStatus;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.serde.RecordSerDe;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.MemberAssignment;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

@Slf4j
public class ClusterUtil {

  private static final String CLUSTER_VERSION_PARAM_KEY = "inter.broker.protocol.version";

  private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

  public static <T> Mono<T> toMono(KafkaFuture<T> future) {
    return Mono.create(sink -> future.whenComplete((res, ex) -> {
      if (ex != null) {
        sink.error(ex);
      } else {
        sink.success(res);
      }
    }));
  }

  public static Mono<String> toMono(KafkaFuture<Void> future, String topicName) {
    return Mono.create(sink -> future.whenComplete((res, ex) -> {
      if (ex != null) {
        sink.error(ex);
      } else {
        sink.success(topicName);
      }
    }));
  }

  public static ConsumerGroup convertToConsumerGroup(ConsumerGroupDescription c) {
    ConsumerGroup consumerGroup = new ConsumerGroup();
    consumerGroup.setConsumerGroupId(c.groupId());
    consumerGroup.setNumConsumers(c.members().size());
    int numTopics = c.members().stream()
        .flatMap(m -> m.assignment().topicPartitions().stream().flatMap(t -> Stream.of(t.topic())))
        .collect(Collectors.toSet()).size();
    consumerGroup.setNumTopics(numTopics);
    consumerGroup.setSimple(c.isSimpleConsumerGroup());
    Optional.ofNullable(c.state())
        .ifPresent(s -> consumerGroup.setState(s.name()));
    Optional.ofNullable(c.coordinator())
        .ifPresent(coord -> consumerGroup.setCoordintor(coord.host()));
    consumerGroup.setPartitionAssignor(c.partitionAssignor());
    return consumerGroup;
  }

  public static ConsumerGroupDetails convertToConsumerGroupDetails(
      ConsumerGroupDescription desc, List<ConsumerTopicPartitionDetail> consumers
  ) {
    return new ConsumerGroupDetails()
        .consumers(consumers)
        .consumerGroupId(desc.groupId())
        .simple(desc.isSimpleConsumerGroup())
        .coordintor(Optional.ofNullable(desc.coordinator()).map(Node::host).orElse(""))
        .state(Optional.ofNullable(desc.state()).map(Enum::name).orElse(""))
        .partitionAssignor(desc.partitionAssignor());
  }

  public static List<ConsumerTopicPartitionDetail> convertToConsumerTopicPartitionDetails(
      MemberDescription consumer,
      Map<TopicPartition, OffsetAndMetadata> groupOffsets,
      Map<TopicPartition, Long> endOffsets,
      String groupId
  ) {
    return consumer.assignment().topicPartitions().stream()
        .map(tp -> {
          long currentOffset = Optional.ofNullable(groupOffsets.get(tp))
              .map(OffsetAndMetadata::offset).orElse(0L);
          long endOffset = Optional.ofNullable(endOffsets.get(tp)).orElse(0L);
          ConsumerTopicPartitionDetail cd = new ConsumerTopicPartitionDetail();
          cd.setGroupId(groupId);
          cd.setConsumerId(consumer.consumerId());
          cd.setHost(consumer.host());
          cd.setTopic(tp.topic());
          cd.setPartition(tp.partition());
          cd.setCurrentOffset(currentOffset);
          cd.setEndOffset(endOffset);
          cd.setMessagesBehind(endOffset - currentOffset);
          return cd;
        }).collect(Collectors.toList());
  }


  public static InternalTopicConfig mapToInternalTopicConfig(ConfigEntry configEntry) {
    InternalTopicConfig.InternalTopicConfigBuilder builder = InternalTopicConfig.builder()
        .name(configEntry.name())
        .value(configEntry.value());
    if (configEntry.name().equals(MESSAGE_FORMAT_VERSION_CONFIG)) {
      builder.defaultValue(configEntry.value());
    } else {
      builder.defaultValue(TOPIC_DEFAULT_CONFIGS.get(configEntry.name()));
    }
    return builder.build();
  }

  public static InternalTopic mapToInternalTopic(TopicDescription topicDescription) {
    var topic = InternalTopic.builder();
    topic.internal(
        topicDescription.isInternal() || topicDescription.name().startsWith("_")
    );
    topic.name(topicDescription.name());

    List<InternalPartition> partitions = topicDescription.partitions().stream().map(
        partition -> {
          var partitionDto = InternalPartition.builder();
          partitionDto.leader(partition.leader().id());
          partitionDto.partition(partition.partition());
          partitionDto.inSyncReplicasCount(partition.isr().size());
          partitionDto.replicasCount(partition.replicas().size());
          List<InternalReplica> replicas = partition.replicas().stream().map(
              r -> new InternalReplica(r.id(), partition.leader().id() != r.id(),
                  partition.isr().contains(r)))
              .collect(Collectors.toList());
          partitionDto.replicas(replicas);
          return partitionDto.build();
        })
        .collect(Collectors.toList());

    int urpCount = partitions.stream()
        .flatMap(partition -> partition.getReplicas().stream())
        .filter(p -> !p.isInSync()).mapToInt(e -> 1)
        .sum();

    int inSyncReplicasCount = partitions.stream()
        .mapToInt(InternalPartition::getInSyncReplicasCount)
        .sum();

    int replicasCount = partitions.stream()
        .mapToInt(InternalPartition::getReplicasCount)
        .sum();

    topic.partitions(partitions.stream().collect(Collectors.toMap(
        InternalPartition::getPartition,
        t -> t
    )));
    topic.replicas(replicasCount);
    topic.partitionCount(topicDescription.partitions().size());
    topic.inSyncReplicas(inSyncReplicasCount);

    topic.replicationFactor(
        topicDescription.partitions().isEmpty()
            ? 0
            : topicDescription.partitions().get(0).replicas().size()
    );

    topic.underReplicatedPartitions(urpCount);

    return topic.build();
  }

  public static int convertToIntServerStatus(ServerStatus serverStatus) {
    return serverStatus.equals(ServerStatus.ONLINE) ? 1 : 0;
  }

  public static TopicMessage mapToTopicMessage(ConsumerRecord<Bytes, Bytes> consumerRecord,
                                               RecordSerDe recordDeserializer) {
    Map<String, String> headers = new HashMap<>();
    consumerRecord.headers().iterator()
        .forEachRemaining(header -> headers.put(header.key(), new String(header.value())));

    TopicMessage topicMessage = new TopicMessage();

    OffsetDateTime timestamp =
        OffsetDateTime.ofInstant(Instant.ofEpochMilli(consumerRecord.timestamp()), UTC_ZONE_ID);
    TopicMessage.TimestampTypeEnum timestampType =
        mapToTimestampType(consumerRecord.timestampType());
    topicMessage.setPartition(consumerRecord.partition());
    topicMessage.setOffset(consumerRecord.offset());
    topicMessage.setTimestamp(timestamp);
    topicMessage.setTimestampType(timestampType);

    topicMessage.setHeaders(headers);
    Tuple2<String, Object> parsed = recordDeserializer.deserialize(consumerRecord);
    topicMessage.setKey(parsed.getT1());
    topicMessage.setContent(parsed.getT2());

    return topicMessage;
  }

  private static TopicMessage.TimestampTypeEnum mapToTimestampType(TimestampType timestampType) {
    switch (timestampType) {
      case CREATE_TIME:
        return TopicMessage.TimestampTypeEnum.CREATE_TIME;
      case LOG_APPEND_TIME:
        return TopicMessage.TimestampTypeEnum.LOG_APPEND_TIME;
      case NO_TIMESTAMP_TYPE:
        return TopicMessage.TimestampTypeEnum.NO_TIMESTAMP_TYPE;
      default:
        throw new IllegalArgumentException("Unknown timestampType: " + timestampType);
    }
  }

  public static Mono<Set<ExtendedAdminClient.SupportedFeature>> getSupportedFeatures(
      AdminClient adminClient) {
    return ClusterUtil.toMono(adminClient.describeCluster().controller())
        .map(Node::id)
        .map(id -> Collections
            .singletonList(new ConfigResource(ConfigResource.Type.BROKER, id.toString())))
        .map(brokerCR -> adminClient.describeConfigs(brokerCR).all())
        .flatMap(ClusterUtil::toMono)
        .map(ClusterUtil::getSupportedUpdateFeature)
        .map(Collections::singleton);
  }

  private static ExtendedAdminClient.SupportedFeature getSupportedUpdateFeature(
      Map<ConfigResource, Config> configs) {
    String version = configs.values().stream()
        .map(Config::entries)
        .flatMap(Collection::stream)
        .filter(entry -> entry.name().contains(CLUSTER_VERSION_PARAM_KEY))
        .findFirst().orElseThrow().value();
    try {
      final String[] parts = version.split("\\.");
      if (parts.length > 2) {
        version = parts[0] + "." + parts[1];
      }
      return Float.parseFloat(version.split("-")[0]) <= 2.3f
          ? ExtendedAdminClient.SupportedFeature.ALTER_CONFIGS :
          ExtendedAdminClient.SupportedFeature.INCREMENTAL_ALTER_CONFIGS;
    } catch (Exception e) {
      log.error("Conversion clusterVersion {} to float value failed", version);
      throw e;
    }
  }

  public static <T, R> Map<T, R> toSingleMap(Stream<Map<T, R>> streamOfMaps) {
    return streamOfMaps
        .reduce((map1, map2) -> Stream.concat(map1.entrySet().stream(), map2.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))).orElseThrow();
  }

  public static Optional<ConsumerGroupDescription> filterConsumerGroupTopic(
      ConsumerGroupDescription description, String topic) {
    final List<MemberDescription> members = description.members().stream()
        .map(m -> filterConsumerMemberTopic(m, topic))
        .filter(m -> !m.assignment().topicPartitions().isEmpty())
        .collect(Collectors.toList());

    if (!members.isEmpty()) {
      return Optional.of(
          new ConsumerGroupDescription(
              description.groupId(),
              description.isSimpleConsumerGroup(),
              members,
              description.partitionAssignor(),
              description.state(),
              description.coordinator()
          )
      );
    } else {
      return Optional.empty();
    }
  }

  public static MemberDescription filterConsumerMemberTopic(
      MemberDescription description, String topic) {
    final Set<TopicPartition> topicPartitions = description.assignment().topicPartitions()
        .stream().filter(tp -> tp.topic().equals(topic))
        .collect(Collectors.toSet());
    MemberAssignment assignment = new MemberAssignment(topicPartitions);
    return new MemberDescription(
        description.consumerId(),
        description.groupInstanceId(),
        description.clientId(),
        description.host(),
        assignment
    );
  }

}
