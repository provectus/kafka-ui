package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.service.ConsumingService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;

@Log4j2
public abstract class OffsetsSeek {
  protected final String topic;
  protected final ConsumerPosition consumerPosition;

  public OffsetsSeek(String topic, ConsumerPosition consumerPosition) {
    this.topic = topic;
    this.consumerPosition = consumerPosition;
  }

  public WaitingOffsets assignAndSeek(Consumer<Bytes, Bytes> consumer) {
    SeekType seekType = consumerPosition.getSeekType();
    log.info("Positioning consumer for topic {} with {}", topic, consumerPosition);
    switch (seekType) {
      case OFFSET:
        assignAndSeekForOffset(consumer);
        break;
      case TIMESTAMP:
        assignAndSeekForTimestamp(consumer);
        break;
      case BEGINNING:
        assignAndSeekFromBeginning(consumer);
        break;
      default:
        throw new IllegalArgumentException("Unknown seekType: " + seekType);
    }
    log.info("Assignment: {}", consumer.assignment());
    return new WaitingOffsets(topic, consumer);
  }

  protected List<TopicPartition> getRequestedPartitions(Consumer<Bytes, Bytes> consumer) {
    Map<Integer, Long> partitionPositions = consumerPosition.getSeekTo();
    return consumer.partitionsFor(topic).stream()
        .filter(
            p -> partitionPositions.isEmpty() || partitionPositions.containsKey(p.partition()))
        .map(p -> new TopicPartition(p.topic(), p.partition()))
        .collect(Collectors.toList());
  }


  protected abstract void assignAndSeekFromBeginning(Consumer<Bytes, Bytes> consumer);

  protected abstract void assignAndSeekForTimestamp(Consumer<Bytes, Bytes> consumer);

  protected abstract void assignAndSeekForOffset(Consumer<Bytes, Bytes> consumer);

  public static class WaitingOffsets {
    final Map<Integer, Long> offsets = new HashMap<>(); // partition number -> offset

    public WaitingOffsets(String topic, Consumer<?, ?> consumer) {
      var partitions = consumer.assignment().stream()
          .map(TopicPartition::partition)
          .collect(Collectors.toList());
      ConsumingService.significantOffsets(consumer, topic, partitions)
          .forEach((tp, offset) -> offsets.put(tp.partition(), offset - 1));
    }

    public void markPolled(ConsumerRecord<?, ?> rec) {
      Long waiting = offsets.get(rec.partition());
      if (waiting != null && waiting <= rec.offset()) {
        offsets.remove(rec.partition());
      }
    }

    public boolean endReached() {
      return offsets.isEmpty();
    }
  }
}
