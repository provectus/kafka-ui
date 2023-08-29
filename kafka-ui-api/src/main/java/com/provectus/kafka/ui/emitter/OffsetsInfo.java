package com.provectus.kafka.ui.emitter;

import com.google.common.base.Preconditions;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.mutable.MutableLong;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;

@Slf4j
@Getter
class OffsetsInfo {

  private final Consumer<?, ?> consumer;

  private final Map<TopicPartition, Long> beginOffsets;
  private final Map<TopicPartition, Long> endOffsets;

  private final Set<TopicPartition> nonEmptyPartitions = new HashSet<>();
  private final Set<TopicPartition> emptyPartitions = new HashSet<>();

  OffsetsInfo(Consumer<?, ?> consumer, String topic) {
    this(consumer,
        consumer.partitionsFor(topic).stream()
            .map(pi -> new TopicPartition(topic, pi.partition()))
            .toList()
    );
  }

  OffsetsInfo(Consumer<?, ?> consumer, Collection<TopicPartition> targetPartitions) {
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

  boolean assignedPartitionsFullyPolled() {
    for (var tp : consumer.assignment()) {
      Preconditions.checkArgument(endOffsets.containsKey(tp));
      if (endOffsets.get(tp) > consumer.position(tp)) {
        return false;
      }
    }
    return true;
  }

  long summaryOffsetsRange() {
    MutableLong cnt = new MutableLong();
    nonEmptyPartitions.forEach(tp -> cnt.add(endOffsets.get(tp) - beginOffsets.get(tp)));
    return cnt.getValue();
  }

}
