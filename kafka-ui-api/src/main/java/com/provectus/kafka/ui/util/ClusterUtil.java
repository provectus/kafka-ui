package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.util.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerGroupState;
import com.provectus.kafka.ui.model.ConsumerGroupTopicPartition;
import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
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
import java.util.ArrayList;
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

  public static InternalConsumerGroup convertToInternalConsumerGroup(
      ConsumerGroupDescription description, Map<TopicPartition, OffsetAndMetadata> offsets) {

    var builder = InternalConsumerGroup.builder();
    builder.groupId(description.groupId());
    builder.simple(description.isSimpleConsumerGroup());
    builder.state(description.state());
    builder.partitionAssignor(description.partitionAssignor());
    builder.members(
        description.members().stream()
            .map(m ->
                InternalConsumerGroup.InternalMember.builder()
                  .assignment(m.assignment().topicPartitions())
                  .clientId(m.clientId())
                  .groupInstanceId(m.groupInstanceId().orElse(""))
                  .consumerId(m.consumerId())
                  .clientId(m.clientId())
                  .host(m.host())
                  .build()
            ).collect(Collectors.toList())
    );
    builder.offsets(offsets);
    Optional.ofNullable(description.coordinator()).ifPresent(builder::coordinator);
    return builder.build();
  }

  public static ConsumerGroup convertToConsumerGroup(InternalConsumerGroup c) {
    return convertToConsumerGroup(c, new ConsumerGroup());
  }

  public static <T extends ConsumerGroup> T convertToConsumerGroup(
      InternalConsumerGroup c, T consumerGroup) {
    consumerGroup.setGroupId(c.getGroupId());
    consumerGroup.setMembers(c.getMembers().size());

    int numTopics = Stream.concat(
        c.getOffsets().keySet().stream().map(TopicPartition::topic),
        c.getMembers().stream()
            .flatMap(m -> m.getAssignment().stream().map(TopicPartition::topic))
    ).collect(Collectors.toSet()).size();

    long messagesBehind = c.getOffsets().entrySet().stream()
        .mapToLong(e ->
            Optional.ofNullable(c.getEndOffsets())
              .map(o -> o.get(e.getKey()))
              .map(o -> o - e.getValue().offset())
              .orElse(0L)
        ).sum();

    consumerGroup.setMessagesBehind(messagesBehind);
    consumerGroup.setTopics(numTopics);
    consumerGroup.setSimple(c.isSimple());

    Optional.ofNullable(c.getState())
        .ifPresent(s -> consumerGroup.setState(mapConsumerGroupState(s)));
    Optional.ofNullable(c.getCoordinator())
        .ifPresent(cd -> consumerGroup.setCoordinator(mapCoordinator(cd)));

    consumerGroup.setPartitionAssignor(c.getPartitionAssignor());
    return consumerGroup;
  }

  public static ConsumerGroupDetails convertToConsumerGroupDetails(InternalConsumerGroup g) {
    final ConsumerGroupDetails details = convertToConsumerGroup(g, new ConsumerGroupDetails());
    Map<TopicPartition, ConsumerGroupTopicPartition> partitionMap = new HashMap<>();

    for (Map.Entry<TopicPartition, OffsetAndMetadata> entry : g.getOffsets().entrySet()) {
      ConsumerGroupTopicPartition partition = new ConsumerGroupTopicPartition();
      partition.setTopic(entry.getKey().topic());
      partition.setPartition(entry.getKey().partition());
      partition.setCurrentOffset(entry.getValue().offset());

      final Optional<Long> endOffset = Optional.ofNullable(g.getEndOffsets())
          .map(o -> o.get(entry.getKey()));

      final Long behind = endOffset.map(o -> o - entry.getValue().offset())
          .orElse(0L);

      partition.setEndOffset(endOffset.orElse(0L));
      partition.setMessagesBehind(behind);

      partitionMap.put(entry.getKey(), partition);
    }

    for (InternalConsumerGroup.InternalMember member : g.getMembers()) {
      for (TopicPartition topicPartition : member.getAssignment()) {
        final ConsumerGroupTopicPartition partition = partitionMap.computeIfAbsent(topicPartition,
            (tp) -> new ConsumerGroupTopicPartition()
                .topic(tp.topic())
                .partition(tp.partition())
        );
        partition.setHost(member.getHost());
        partition.setConsumerId(member.getConsumerId());
        partitionMap.put(topicPartition, partition);
      }
    }
    details.setPartitions(new ArrayList<>(partitionMap.values()));
    return details;
  }

  private static Broker mapCoordinator(Node node) {
    return new Broker().host(node.host()).id(node.id());
  }

  private static ConsumerGroupState mapConsumerGroupState(
      org.apache.kafka.common.ConsumerGroupState state) {
    switch (state) {
      case DEAD: return ConsumerGroupState.DEAD;
      case EMPTY: return ConsumerGroupState.EMPTY;
      case STABLE: return ConsumerGroupState.STABLE;
      case PREPARING_REBALANCE: return ConsumerGroupState.PREPARING_REBALANCE;
      case COMPLETING_REBALANCE: return ConsumerGroupState.COMPLETING_REBALANCE;
      default: return ConsumerGroupState.UNKNOWN;
    }
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
    var parsed = recordDeserializer.deserialize(consumerRecord);
    topicMessage.setKey(parsed.getKey());
    topicMessage.setContent(parsed.getValue());

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
    return getClusterVersion(adminClient)
        .map(ClusterUtil::getSupportedUpdateFeature)
        .map(Collections::singleton);
  }

  private static ExtendedAdminClient.SupportedFeature getSupportedUpdateFeature(String version) {
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

  public static Mono<String> getClusterVersion(AdminClient adminClient) {
    return ClusterUtil.toMono(adminClient.describeCluster().controller())
        .map(Node::id)
        .map(id -> Collections
            .singletonList(new ConfigResource(ConfigResource.Type.BROKER, id.toString())))
        .map(brokerCR -> adminClient.describeConfigs(brokerCR).all())
        .flatMap(ClusterUtil::toMono)
        .map(ClusterUtil::getClusterVersion);
  }

  public static String getClusterVersion(Map<ConfigResource, Config> configs) {
    return configs.values().stream()
        .map(Config::entries)
        .flatMap(Collection::stream)
        .filter(entry -> entry.name().contains(CLUSTER_VERSION_PARAM_KEY))
        .findFirst().orElseThrow().value();
  }


  public static <T, R> Map<T, R> toSingleMap(Stream<Map<T, R>> streamOfMaps) {
    return streamOfMaps
        .reduce((map1, map2) -> Stream.concat(map1.entrySet().stream(), map2.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))).orElseThrow();
  }

  public static Optional<InternalConsumerGroup> filterConsumerGroupTopic(
      InternalConsumerGroup consumerGroup, Optional<String> topic) {

    final Map<TopicPartition, OffsetAndMetadata> offsets =
        consumerGroup.getOffsets().entrySet().stream()
            .filter(e -> topic.isEmpty() || e.getKey().topic().equals(topic.get()))
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue
            ));

    final Collection<InternalConsumerGroup.InternalMember> members =
        consumerGroup.getMembers().stream()
            .map(m -> filterConsumerMemberTopic(m, topic))
            .filter(m -> !m.getAssignment().isEmpty())
            .collect(Collectors.toList());

    if (!members.isEmpty() || !offsets.isEmpty()) {
      return Optional.of(
          consumerGroup.toBuilder()
            .offsets(offsets)
            .members(members)
            .build()
      );
    } else {
      return Optional.empty();
    }
  }

  public static InternalConsumerGroup.InternalMember filterConsumerMemberTopic(
      InternalConsumerGroup.InternalMember member, Optional<String> topic) {
    final Set<TopicPartition> topicPartitions = member.getAssignment()
        .stream().filter(tp -> topic.isEmpty() || tp.topic().equals(topic.get()))
        .collect(Collectors.toSet());
    return member.toBuilder().assignment(topicPartitions).build();
  }
}
