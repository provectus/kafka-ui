package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.ConsumerGroupStateDTO;
import com.provectus.kafka.ui.model.ConsumerGroupTopicPartitionDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.MessageFormatDTO;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;


@Log4j2
public class ClusterUtil {

  private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

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

  public static ConsumerGroupDTO convertToConsumerGroup(InternalConsumerGroup c) {
    return convertToConsumerGroup(c, new ConsumerGroupDTO());
  }

  public static <T extends ConsumerGroupDTO> T convertToConsumerGroup(
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

  public static ConsumerGroupDetailsDTO convertToConsumerGroupDetails(InternalConsumerGroup g) {
    ConsumerGroupDetailsDTO details = convertToConsumerGroup(g, new ConsumerGroupDetailsDTO());
    Map<TopicPartition, ConsumerGroupTopicPartitionDTO> partitionMap = new HashMap<>();

    for (Map.Entry<TopicPartition, OffsetAndMetadata> entry : g.getOffsets().entrySet()) {
      ConsumerGroupTopicPartitionDTO partition = new ConsumerGroupTopicPartitionDTO();
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
        final ConsumerGroupTopicPartitionDTO partition = partitionMap.computeIfAbsent(
            topicPartition,
            (tp) -> new ConsumerGroupTopicPartitionDTO()
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

  private static BrokerDTO mapCoordinator(Node node) {
    return new BrokerDTO().host(node.host()).id(node.id());
  }

  private static ConsumerGroupStateDTO mapConsumerGroupState(
      org.apache.kafka.common.ConsumerGroupState state) {
    switch (state) {
      case DEAD: return ConsumerGroupStateDTO.DEAD;
      case EMPTY: return ConsumerGroupStateDTO.EMPTY;
      case STABLE: return ConsumerGroupStateDTO.STABLE;
      case PREPARING_REBALANCE: return ConsumerGroupStateDTO.PREPARING_REBALANCE;
      case COMPLETING_REBALANCE: return ConsumerGroupStateDTO.COMPLETING_REBALANCE;
      default: return ConsumerGroupStateDTO.UNKNOWN;
    }
  }

  public static int convertToIntServerStatus(ServerStatusDTO serverStatus) {
    return serverStatus.equals(ServerStatusDTO.ONLINE) ? 1 : 0;
  }

  public static TopicMessageDTO mapToTopicMessage(ConsumerRecord<Bytes, Bytes> consumerRecord,
                                                  RecordSerDe recordDeserializer) {

    Map<String, String> headers = new HashMap<>();
    consumerRecord.headers().iterator()
        .forEachRemaining(header ->
            headers.put(
                header.key(),
                header.value() != null ? new String(header.value()) : null
            )
    );

    TopicMessageDTO topicMessage = new TopicMessageDTO();

    OffsetDateTime timestamp =
        OffsetDateTime.ofInstant(Instant.ofEpochMilli(consumerRecord.timestamp()), UTC_ZONE_ID);
    TopicMessageDTO.TimestampTypeEnum timestampType =
        mapToTimestampType(consumerRecord.timestampType());
    topicMessage.setPartition(consumerRecord.partition());
    topicMessage.setOffset(consumerRecord.offset());
    topicMessage.setTimestamp(timestamp);
    topicMessage.setTimestampType(timestampType);

    topicMessage.setHeaders(headers);
    var parsed = recordDeserializer.deserialize(consumerRecord);
    topicMessage.setKey(parsed.getKey());
    topicMessage.setContent(parsed.getValue());
    topicMessage.setKeyFormat(parsed.getKeyFormat() != null
        ? MessageFormatDTO.valueOf(parsed.getKeyFormat().name())
        : null);
    topicMessage.setValueFormat(parsed.getValueFormat() != null
        ? MessageFormatDTO.valueOf(parsed.getValueFormat().name())
        : null);
    topicMessage.setKeySize(ConsumerRecordUtil.getKeySize(consumerRecord));
    topicMessage.setValueSize(ConsumerRecordUtil.getValueSize(consumerRecord));
    topicMessage.setKeySchemaId(parsed.getKeySchemaId());
    topicMessage.setValueSchemaId(parsed.getValueSchemaId());
    topicMessage.setHeadersSize(ConsumerRecordUtil.getHeadersSize(consumerRecord));

    return topicMessage;
  }

  private static TopicMessageDTO.TimestampTypeEnum mapToTimestampType(TimestampType timestampType) {
    switch (timestampType) {
      case CREATE_TIME:
        return TopicMessageDTO.TimestampTypeEnum.CREATE_TIME;
      case LOG_APPEND_TIME:
        return TopicMessageDTO.TimestampTypeEnum.LOG_APPEND_TIME;
      case NO_TIMESTAMP_TYPE:
        return TopicMessageDTO.TimestampTypeEnum.NO_TIMESTAMP_TYPE;
      default:
        throw new IllegalArgumentException("Unknown timestampType: " + timestampType);
    }
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
