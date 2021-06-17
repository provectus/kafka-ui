package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Log4j2
public class OffsetsSeekBackward extends OffsetsSeek {

  private final int maxMessages;

  public OffsetsSeekBackward(String topic,
                             ConsumerPosition consumerPosition, int maxMessages) {
    super(topic, consumerPosition);
    this.maxMessages = maxMessages;
  }


  protected void assignAndSeekForOffset(Consumer<Bytes, Bytes> consumer) {
    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    consumer.assign(partitions);
    final Map<TopicPartition, Long> offsets =
        findOffsetsInt(consumer, consumerPosition.getSeekTo());
    offsets.forEach(consumer::seek);
  }

  protected void assignAndSeekFromBeginning(Consumer<Bytes, Bytes> consumer) {
    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    consumer.assign(partitions);
    final Map<TopicPartition, Long> offsets = findOffsets(consumer, Map.of());
    offsets.forEach(consumer::seek);
  }

  protected void assignAndSeekForTimestamp(Consumer<Bytes, Bytes> consumer) {
    Map<TopicPartition, Long> timestampsToSearch =
        consumerPosition.getSeekTo().entrySet().stream()
            .collect(Collectors.toMap(
                partitionPosition -> new TopicPartition(topic, partitionPosition.getKey()),
                e -> e.getValue() + 1
            ));
    Map<TopicPartition, Long> offsetsForTimestamps = consumer.offsetsForTimes(timestampsToSearch)
        .entrySet().stream()
        .filter(e -> e.getValue() != null)
        .map(v -> Tuples.of(v.getKey(), v.getValue().offset() - 1))
        .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));

    if (offsetsForTimestamps.isEmpty()) {
      throw new IllegalArgumentException("No offsets were found for requested timestamps");
    }

    consumer.assign(offsetsForTimestamps.keySet());
    final Map<TopicPartition, Long> offsets = findOffsets(consumer, offsetsForTimestamps);
    offsets.forEach(consumer::seek);
  }

  protected Map<TopicPartition, Long> findOffsetsInt(
      Consumer<Bytes, Bytes> consumer, Map<Integer, Long> seekTo) {

    final Map<TopicPartition, Long> seekMap = seekTo.entrySet()
        .stream().map(p ->
            Tuples.of(
                new TopicPartition(topic, p.getKey()),
                p.getValue()
            )
        ).collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));

    return findOffsets(consumer, seekMap);
  }

  protected Map<TopicPartition, Long> findOffsets(
      Consumer<Bytes, Bytes> consumer, Map<TopicPartition, Long> seekTo) {

    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    final Map<TopicPartition, Long> beginningOffsets = consumer.beginningOffsets(partitions);
    final Map<TopicPartition, Long> endOffsets = consumer.endOffsets(partitions);

    final Map<TopicPartition, Long> seekMap = new HashMap<>(seekTo);
    int awaitingMessages = maxMessages;

    Set<TopicPartition> waiting = new HashSet<>(partitions);

    while (awaitingMessages > 0 && !waiting.isEmpty()) {
      final int msgsPerPartition = (int) Math.ceil((double) awaitingMessages / partitions.size());
      for (TopicPartition partition : partitions) {
        final Long offset = Optional.ofNullable(seekMap.get(partition))
            .orElseGet(() -> endOffsets.get(partition));
        final Long beginning = beginningOffsets.get(partition);

        if (offset - beginning > msgsPerPartition) {
          seekMap.put(partition, offset - msgsPerPartition);
          awaitingMessages -= msgsPerPartition;
        } else {
          final long num = offset - beginning;
          if (num > 0) {
            seekMap.put(partition, offset - num);
            awaitingMessages -= num;
          } else {
            waiting.remove(partition);
          }
        }

        if (awaitingMessages <= 0) {
          break;
        }
      }
    }

    return seekMap;
  }
}
