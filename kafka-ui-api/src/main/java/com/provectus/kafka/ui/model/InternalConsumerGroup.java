package com.provectus.kafka.ui.model;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.ConsumerGroupState;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;

@Data
@Builder(toBuilder = true)
public class InternalConsumerGroup {
  private final String groupId;
  private final boolean simple;
  private final Collection<InternalMember> members;
  private final Map<TopicPartition, OffsetAndMetadata> offsets;
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
}
