package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
public abstract class OffsetsSeek {
  protected final String topic;
  protected final ConsumerPosition consumerPosition;

  protected OffsetsSeek(String topic, ConsumerPosition consumerPosition) {
    this.topic = topic;
    this.consumerPosition = consumerPosition;
  }

  public ConsumerPosition getConsumerPosition() {
    return consumerPosition;
  }

  public Map<TopicPartition, Long> getPartitionsOffsets(Consumer<Bytes, Bytes> consumer) {
    SeekTypeDTO seekType = consumerPosition.getSeekType();
    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    log.info("Positioning consumer for topic {} with {}", topic, consumerPosition);
    Map<TopicPartition, Long> offsets;
    switch (seekType) {
      case OFFSET:
        offsets = offsetsFromPositions(consumer, partitions);
        break;
      case TIMESTAMP:
        offsets = offsetsForTimestamp(consumer);
        break;
      case BEGINNING:
        offsets = offsetsFromBeginning(consumer, partitions);
        break;
      case LATEST:
        offsets = endOffsets(consumer, partitions);
        break;
      default:
        throw new IllegalArgumentException("Unknown seekType: " + seekType);
    }
    return offsets;
  }

  public WaitingOffsets waitingOffsets(Consumer<Bytes, Bytes> consumer,
                                       Collection<TopicPartition> partitions) {
    return new WaitingOffsets(topic, consumer, partitions);
  }

  public WaitingOffsets assignAndSeek(Consumer<Bytes, Bytes> consumer) {
    final Map<TopicPartition, Long> partitionsOffsets = getPartitionsOffsets(consumer);
    consumer.assign(partitionsOffsets.keySet());
    partitionsOffsets.forEach(consumer::seek);
    log.info("Assignment: {}", consumer.assignment());
    return waitingOffsets(consumer, partitionsOffsets.keySet());
  }


  public List<TopicPartition> getRequestedPartitions(Consumer<Bytes, Bytes> consumer) {
    Map<TopicPartition, Long> partitionPositions = consumerPosition.getSeekTo();
    return consumer.partitionsFor(topic).stream()
        .filter(
            p -> partitionPositions.isEmpty()
                || partitionPositions.containsKey(new TopicPartition(p.topic(), p.partition()))
        ).map(p -> new TopicPartition(p.topic(), p.partition()))
        .collect(Collectors.toList());
  }

  protected Map<TopicPartition, Long> endOffsets(
      Consumer<Bytes, Bytes> consumer, List<TopicPartition> partitions) {
    return consumer.endOffsets(partitions);
  }

  protected abstract Map<TopicPartition, Long> offsetsFromBeginning(
      Consumer<Bytes, Bytes> consumer, List<TopicPartition> partitions);

  protected abstract Map<TopicPartition, Long> offsetsForTimestamp(
      Consumer<Bytes, Bytes> consumer);

  protected abstract Map<TopicPartition, Long> offsetsFromPositions(
      Consumer<Bytes, Bytes> consumer, List<TopicPartition> partitions);

  public static class WaitingOffsets {
    private final Map<Integer, Long> endOffsets; // partition number -> offset
    private final Map<Integer, Long> beginOffsets; // partition number -> offset
    private final String topic;

    public WaitingOffsets(String topic, Consumer<?, ?> consumer,
                          Collection<TopicPartition> partitions) {
      this.topic = topic;
      var allBeginningOffsets = consumer.beginningOffsets(partitions);
      var allEndOffsets = consumer.endOffsets(partitions);

      this.endOffsets = allEndOffsets.entrySet().stream()
          .filter(entry -> !allBeginningOffsets.get(entry.getKey()).equals(entry.getValue()))
          .map(e -> Tuples.of(e.getKey().partition(), e.getValue() - 1))
          .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));

      this.beginOffsets = this.endOffsets.keySet().stream()
          .map(p -> Tuples.of(p, allBeginningOffsets.get(new TopicPartition(topic, p))))
          .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));
    }

    public List<TopicPartition> topicPartitions() {
      return this.endOffsets.keySet().stream()
          .map(p -> new TopicPartition(topic, p))
          .collect(Collectors.toList());
    }

    public void markPolled(int partition) {
      endOffsets.remove(partition);
      beginOffsets.remove(partition);
    }

    public void markPolled(ConsumerRecord<?, ?> rec) {
      Long endWaiting = endOffsets.get(rec.partition());
      if (endWaiting != null && endWaiting <= rec.offset()) {
        endOffsets.remove(rec.partition());
      }
      Long beginWaiting = beginOffsets.get(rec.partition());
      if (beginWaiting != null && beginWaiting >= rec.offset()) {
        beginOffsets.remove(rec.partition());
      }

    }

    public boolean endReached() {
      return endOffsets.isEmpty();
    }

    public boolean beginReached() {
      return beginOffsets.isEmpty();
    }

    public Map<Integer, Long> getEndOffsets() {
      return endOffsets;
    }

    public Map<Integer, Long> getBeginOffsets() {
      return beginOffsets;
    }
  }
}
