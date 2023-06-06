package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.ConsumerGroupStateDTO;
import com.provectus.kafka.ui.model.ConsumerGroupTopicPartitionDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.InternalTopicConsumerGroup;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;

public class ConsumerGroupMapper {

  private ConsumerGroupMapper() {
  }

  public static ConsumerGroupDTO toDto(InternalConsumerGroup c) {
    return convertToConsumerGroup(c, new ConsumerGroupDTO());
  }

  public static ConsumerGroupDTO toDto(InternalTopicConsumerGroup c) {
    ConsumerGroupDTO consumerGroup = new ConsumerGroupDetailsDTO();
    consumerGroup.setTopics(1); //for ui backward-compatibility, need to rm usage from ui
    consumerGroup.setGroupId(c.getGroupId());
    consumerGroup.setMembers(c.getMembers());
    consumerGroup.setConsumerLag(c.getConsumerLag());
    consumerGroup.setSimple(c.isSimple());
    consumerGroup.setPartitionAssignor(c.getPartitionAssignor());
    consumerGroup.setState(mapConsumerGroupState(c.getState()));
    Optional.ofNullable(c.getCoordinator())
        .ifPresent(cd -> consumerGroup.setCoordinator(mapCoordinator(cd)));
    return consumerGroup;
  }

  public static ConsumerGroupDetailsDTO toDetailsDto(InternalConsumerGroup g) {
    ConsumerGroupDetailsDTO details = convertToConsumerGroup(g, new ConsumerGroupDetailsDTO());
    Map<TopicPartition, ConsumerGroupTopicPartitionDTO> partitionMap = new HashMap<>();

    for (Map.Entry<TopicPartition, Long> entry : g.getOffsets().entrySet()) {
      ConsumerGroupTopicPartitionDTO partition = new ConsumerGroupTopicPartitionDTO();
      partition.setTopic(entry.getKey().topic());
      partition.setPartition(entry.getKey().partition());
      partition.setCurrentOffset(entry.getValue());

      final Optional<Long> endOffset = Optional.ofNullable(g.getEndOffsets())
          .map(o -> o.get(entry.getKey()));

      final Long behind = endOffset.map(o -> o - entry.getValue())
          .orElse(0L);

      partition.setEndOffset(endOffset.orElse(0L));
      partition.setConsumerLag(behind);

      partitionMap.put(entry.getKey(), partition);
    }

    for (InternalConsumerGroup.InternalMember member : g.getMembers()) {
      for (TopicPartition topicPartition : member.getAssignment()) {
        final ConsumerGroupTopicPartitionDTO partition = partitionMap.computeIfAbsent(
            topicPartition,
            tp -> new ConsumerGroupTopicPartitionDTO()
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

  private static <T extends ConsumerGroupDTO> T convertToConsumerGroup(
      InternalConsumerGroup c, T consumerGroup) {
    consumerGroup.setGroupId(c.getGroupId());
    consumerGroup.setMembers(c.getMembers().size());
    consumerGroup.setConsumerLag(c.getConsumerLag());
    consumerGroup.setTopics(c.getTopicNum());
    consumerGroup.setSimple(c.isSimple());

    Optional.ofNullable(c.getState())
        .ifPresent(s -> consumerGroup.setState(mapConsumerGroupState(s)));
    Optional.ofNullable(c.getCoordinator())
        .ifPresent(cd -> consumerGroup.setCoordinator(mapCoordinator(cd)));

    consumerGroup.setPartitionAssignor(c.getPartitionAssignor());
    return consumerGroup;
  }

  private static BrokerDTO mapCoordinator(Node node) {
    return new BrokerDTO().host(node.host()).id(node.id()).port(node.port());
  }

  private static ConsumerGroupStateDTO mapConsumerGroupState(
      org.apache.kafka.common.ConsumerGroupState state) {
    switch (state) {
      case DEAD:
        return ConsumerGroupStateDTO.DEAD;
      case EMPTY:
        return ConsumerGroupStateDTO.EMPTY;
      case STABLE:
        return ConsumerGroupStateDTO.STABLE;
      case PREPARING_REBALANCE:
        return ConsumerGroupStateDTO.PREPARING_REBALANCE;
      case COMPLETING_REBALANCE:
        return ConsumerGroupStateDTO.COMPLETING_REBALANCE;
      default:
        return ConsumerGroupStateDTO.UNKNOWN;
    }
  }


}
