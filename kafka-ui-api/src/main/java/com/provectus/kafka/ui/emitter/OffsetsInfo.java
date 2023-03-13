package com.provectus.kafka.ui.emitter;

import com.google.common.base.Preconditions;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;

@Slf4j
@Getter
public class OffsetsInfo {

  private final Consumer<?, ?> consumer;

  private final Map<TopicPartition, Long> beginOffsets;
  private final Map<TopicPartition, Long> endOffsets;

  private final Set<TopicPartition> nonEmptyPartitions = new HashSet<>();
  private final Set<TopicPartition> emptyPartitions = new HashSet<>();

  public OffsetsInfo(Consumer<?, ?> consumer, String topic) {
    this(consumer,
        consumer.partitionsFor(topic).stream()
            .map(pi -> new TopicPartition(topic, pi.partition()))
            .collect(Collectors.toList())
    );
  }

  public OffsetsInfo(Consumer<?, ?> consumer,
                     Collection<TopicPartition> targetPartitions) {
    this.consumer = consumer;
    this.beginOffsets = consumer.beginningOffsets(targetPartitions);
    this.endOffsets = consumer.endOffsets(targetPartitions);
    endOffsets.forEach((tp, endOffset) -> {
      var beginningOffset = beginOffsets.get(tp);
      if (endOffset > beginningOffset) {
        nonEmptyPartitions.add(tp);
      } else {
        emptyPartitions.add(tp);
      }
    });
  }

  public boolean assignedPartitionsFullyPolled() {
    for (var tp: consumer.assignment()) {
      Preconditions.checkArgument(endOffsets.containsKey(tp));
      if (endOffsets.get(tp) > consumer.position(tp)) {
        return false;
      }
    }
    return true;
  }

}
