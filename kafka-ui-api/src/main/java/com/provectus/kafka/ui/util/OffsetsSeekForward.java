package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class OffsetsSeekForward extends OffsetsSeek {

  public OffsetsSeekForward(String topic, ConsumerPosition consumerPosition) {
    super(topic, consumerPosition);
  }

  protected Map<TopicPartition, Long> offsetsFromPositions(Consumer<Bytes, Bytes> consumer,
                                                           List<TopicPartition> partitions) {
    final Map<TopicPartition, Long> offsets =
        offsetsFromBeginning(consumer, partitions);

    final Map<TopicPartition, Long> endOffsets = consumer.endOffsets(offsets.keySet());
    final Set<TopicPartition> set = new HashSet<>(consumerPosition.getSeekTo().keySet());
    final Map<TopicPartition, Long> collect = consumerPosition.getSeekTo().entrySet().stream()
        .filter(e -> e.getValue() < endOffsets.get(e.getKey()))
        .filter(e -> endOffsets.get(e.getKey()) > offsets.get(e.getKey()))
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue
        ));
    offsets.putAll(collect);
    set.removeAll(collect.keySet());
    set.forEach(offsets::remove);

    return offsets;
  }

  protected Map<TopicPartition, Long> offsetsForTimestamp(Consumer<Bytes, Bytes> consumer) {
    Map<TopicPartition, Long> offsetsForTimestamps =
        consumer.offsetsForTimes(consumerPosition.getSeekTo())
            .entrySet().stream()
            .filter(e -> e.getValue() != null)
            .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().offset()));

    if (offsetsForTimestamps.isEmpty()) {
      throw new IllegalArgumentException("No offsets were found for requested timestamps");
    }

    return offsetsForTimestamps;
  }

  protected Map<TopicPartition, Long> offsetsFromBeginning(Consumer<Bytes, Bytes> consumer,
                                                           List<TopicPartition> partitions) {
    return consumer.beginningOffsets(partitions);
  }

}
