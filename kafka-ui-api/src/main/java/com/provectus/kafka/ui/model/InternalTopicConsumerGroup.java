package com.provectus.kafka.ui.model;

import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Value;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.common.ConsumerGroupState;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;

@Value
@Builder
public class InternalTopicConsumerGroup {

  String groupId;
  int members;
  @Nullable
  Long consumerLag; //null means no committed offsets found for this group
  boolean isSimple;
  String partitionAssignor;
  ConsumerGroupState state;
  @Nullable
  Node coordinator;

  public static InternalTopicConsumerGroup create(
      String topic,
      ConsumerGroupDescription g,
      Map<TopicPartition, Long> committedOffsets,
      Map<TopicPartition, Long> endOffsets) {
    return InternalTopicConsumerGroup.builder()
        .groupId(g.groupId())
        .members(
            (int) g.members().stream()
                // counting only members with target topic assignment
                .filter(m -> m.assignment().topicPartitions().stream().anyMatch(p -> p.topic().equals(topic)))
                .count()
        )
        .consumerLag(calculateConsumerLag(committedOffsets, endOffsets))
        .isSimple(g.isSimpleConsumerGroup())
        .partitionAssignor(g.partitionAssignor())
        .state(g.state())
        .coordinator(g.coordinator())
        .build();
  }

  @Nullable
  private static Long calculateConsumerLag(Map<TopicPartition, Long> committedOffsets,
                                           Map<TopicPartition, Long> endOffsets) {
    if (committedOffsets.isEmpty()) {
      return null;
    }
    return committedOffsets.entrySet().stream()
        .mapToLong(e ->
            Optional.ofNullable(endOffsets.get(e.getKey()))
                .map(o -> o - e.getValue())
                .orElse(0L)
        ).sum();
  }
}
