package com.provectus.kafka.ui.model;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
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
    builder.offsets(groupOffsets);
    builder.endOffsets(topicEndOffsets);
    Optional.ofNullable(description.coordinator()).ifPresent(builder::coordinator);
    return builder.build();
  }
}
