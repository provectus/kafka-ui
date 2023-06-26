package com.provectus.kafka.ui.model;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.common.ConsumerGroupState;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;

@Data
@Builder(toBuilder = true)
public class InternalConsumerGroup {
  private final String groupId;
  private final boolean simple;
  private final Collection<InternalMember> members;
  private final Map<TopicPartition, Long> offsets;
  private final Map<TopicPartition, Long> endOffsets;
  private final Long consumerLag;
  private final Integer topicNum;
  private final String partitionAssignor;
  private final ConsumerGroupState state;
  private final Node coordinator;

  @Data
  @Builder(toBuilder = true)
  public static class InternalMember {
    private final String consumerId;
    private final String groupInstanceId;
    private final String clientId;
    private final String host;
    private final Set<TopicPartition> assignment;
  }

  public static InternalConsumerGroup create(
      ConsumerGroupDescription description,
      Map<TopicPartition, Long> groupOffsets,
      Map<TopicPartition, Long> topicEndOffsets) {
    var builder = InternalConsumerGroup.builder();
    builder.groupId(description.groupId());
    builder.simple(description.isSimpleConsumerGroup());
    builder.state(description.state());
    builder.partitionAssignor(description.partitionAssignor());
    Collection<InternalMember> internalMembers = initInternalMembers(description);
    builder.members(internalMembers);
    builder.offsets(groupOffsets);
    builder.endOffsets(topicEndOffsets);
    builder.consumerLag(calculateConsumerLag(groupOffsets, topicEndOffsets));
    builder.topicNum(calculateTopicNum(groupOffsets, internalMembers));
    Optional.ofNullable(description.coordinator()).ifPresent(builder::coordinator);
    return builder.build();
  }

  private static Long calculateConsumerLag(Map<TopicPartition, Long> offsets, Map<TopicPartition, Long> endOffsets) {
    Long consumerLag = null;
    // consumerLag should be undefined if no committed offsets found for topic
    if (!offsets.isEmpty()) {
      consumerLag = offsets.entrySet().stream()
          .mapToLong(e ->
              Optional.ofNullable(endOffsets)
                  .map(o -> o.get(e.getKey()))
                  .map(o -> o - e.getValue())
                  .orElse(0L)
          ).sum();
    }

    return consumerLag;
  }

  private static Integer calculateTopicNum(Map<TopicPartition, Long> offsets, Collection<InternalMember> members) {

    return (int) Stream.concat(
        offsets.keySet().stream().map(TopicPartition::topic),
        members.stream()
            .flatMap(m -> m.getAssignment().stream().map(TopicPartition::topic))
    ).distinct().count();

  }

  private static Collection<InternalMember> initInternalMembers(ConsumerGroupDescription description) {
    return description.members().stream()
        .map(m ->
            InternalConsumerGroup.InternalMember.builder()
                .assignment(m.assignment().topicPartitions())
                .clientId(m.clientId())
                .groupInstanceId(m.groupInstanceId().orElse(""))
                .consumerId(m.consumerId())
                .clientId(m.clientId())
                .host(m.host())
                .build()
        ).collect(Collectors.toList());
  }


}
