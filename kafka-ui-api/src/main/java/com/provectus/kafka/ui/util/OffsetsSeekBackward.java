package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
public class OffsetsSeekBackward extends OffsetsSeek {

  private final int maxMessages;

  public OffsetsSeekBackward(String topic,
                             ConsumerPosition consumerPosition, int maxMessages) {
    super(topic, consumerPosition);
    this.maxMessages = maxMessages;
  }

  public int msgsPerPartition(int partitionsSize) {
    return msgsPerPartition(maxMessages, partitionsSize);
  }

  public int msgsPerPartition(long awaitingMessages, int partitionsSize) {
    return (int) Math.ceil((double) awaitingMessages / partitionsSize);
  }


  protected Map<TopicPartition, Long> offsetsFromPositions(Consumer<Bytes, Bytes> consumer,
                                                           List<TopicPartition> partitions) {

    return findOffsetsInt(consumer, consumerPosition.getSeekTo(), partitions);
  }

  protected Map<TopicPartition, Long> offsetsFromBeginning(Consumer<Bytes, Bytes> consumer,
                                                           List<TopicPartition> partitions) {
    return findOffsets(consumer, Map.of(), partitions);
  }

  protected Map<TopicPartition, Long> offsetsForTimestamp(Consumer<Bytes, Bytes> consumer) {
    Map<TopicPartition, Long> timestampsToSearch =
        consumerPosition.getSeekTo().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue
            ));
    Map<TopicPartition, Long> offsetsForTimestamps = consumer.offsetsForTimes(timestampsToSearch)
        .entrySet().stream()
        .filter(e -> e.getValue() != null)
        .map(v -> Tuples.of(v.getKey(), v.getValue().offset()))
        .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));

    if (offsetsForTimestamps.isEmpty()) {
      throw new IllegalArgumentException("No offsets were found for requested timestamps");
    }

    log.info("Timestamps: {} to offsets: {}", timestampsToSearch, offsetsForTimestamps);

    return findOffsets(consumer, offsetsForTimestamps, offsetsForTimestamps.keySet());
  }

  protected Map<TopicPartition, Long> findOffsetsInt(
      Consumer<Bytes, Bytes> consumer, Map<TopicPartition, Long> seekTo,
      List<TopicPartition> partitions) {
    return findOffsets(consumer, seekTo, partitions);
  }

  protected Map<TopicPartition, Long> findOffsets(
      Consumer<Bytes, Bytes> consumer, Map<TopicPartition, Long> seekTo,
      Collection<TopicPartition> partitions) {

    final Map<TopicPartition, Long> beginningOffsets = consumer.beginningOffsets(partitions);
    final Map<TopicPartition, Long> endOffsets = consumer.endOffsets(partitions);

    final Map<TopicPartition, Long> seekMap = new HashMap<>();
    final Set<TopicPartition> emptyPartitions = new HashSet<>();

    for (Map.Entry<TopicPartition, Long> entry : seekTo.entrySet()) {
      final Long endOffset = endOffsets.get(entry.getKey());
      final Long beginningOffset = beginningOffsets.get(entry.getKey());
      if (beginningOffset != null
          && endOffset != null
          && beginningOffset < endOffset
          && entry.getValue() > beginningOffset
      ) {
        final Long value;
        if (entry.getValue() > endOffset) {
          value = endOffset;
        } else {
          value = entry.getValue();
        }

        seekMap.put(entry.getKey(), value);
      } else {
        emptyPartitions.add(entry.getKey());
      }
    }

    Set<TopicPartition> waiting = new HashSet<>(partitions);
    waiting.removeAll(emptyPartitions);
    waiting.removeAll(seekMap.keySet());

    for (TopicPartition topicPartition : waiting) {
      seekMap.put(topicPartition, endOffsets.get(topicPartition));
    }

    return seekMap;
  }


}
