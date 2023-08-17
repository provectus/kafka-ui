package com.provectus.kafka.ui.emitter;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.mutable.MutableLong;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;

@RequiredArgsConstructor(access = AccessLevel.PACKAGE)
public class SeekOperations {

  private final Consumer<?, ?> consumer;
  private final OffsetsInfo offsetsInfo;
  private final Map<TopicPartition, Long> offsetsForSeek; //only contains non-empty partitions!

  public static SeekOperations create(Consumer<?, ?> consumer, ConsumerPosition consumerPosition) {
    OffsetsInfo offsetsInfo;
    if (consumerPosition.getSeekTo() == null) {
      offsetsInfo = new OffsetsInfo(consumer, consumerPosition.getTopic());
    } else {
      offsetsInfo = new OffsetsInfo(consumer, consumerPosition.getSeekTo().keySet());
    }
    return new SeekOperations(
        consumer,
        offsetsInfo,
        getOffsetsForSeek(consumer, offsetsInfo, consumerPosition.getSeekType(), consumerPosition.getSeekTo())
    );
  }

  public void assignAndSeekNonEmptyPartitions() {
    consumer.assign(offsetsForSeek.keySet());
    offsetsForSeek.forEach(consumer::seek);
  }

  public Map<TopicPartition, Long> getBeginOffsets() {
    return offsetsInfo.getBeginOffsets();
  }

  public Map<TopicPartition, Long> getEndOffsets() {
    return offsetsInfo.getEndOffsets();
  }

  public boolean assignedPartitionsFullyPolled() {
    return offsetsInfo.assignedPartitionsFullyPolled();
  }

  // sum of (end - start) offsets for all partitions
  public long summaryOffsetsRange() {
    return offsetsInfo.summaryOffsetsRange();
  }

  // sum of differences between initial consumer seek and current consumer position (across all partitions)
  public long offsetsProcessedFromSeek() {
    MutableLong count = new MutableLong();
    offsetsForSeek.forEach((tp, initialOffset) -> count.add(consumer.position(tp) - initialOffset));
    return count.getValue();
  }

  // Get offsets to seek to. NOTE: offsets do not contain empty partitions offsets
  public Map<TopicPartition, Long> getOffsetsForSeek() {
    return offsetsForSeek;
  }

  /**
   * Finds offsets for ConsumerPosition. Note: will return empty map if no offsets found for desired criteria.
   */
  @VisibleForTesting
  static Map<TopicPartition, Long> getOffsetsForSeek(Consumer<?, ?> consumer,
                                                     OffsetsInfo offsetsInfo,
                                                     SeekTypeDTO seekType,
                                                     @Nullable Map<TopicPartition, Long> seekTo) {
    switch (seekType) {
      case LATEST:
        return consumer.endOffsets(offsetsInfo.getNonEmptyPartitions());
      case BEGINNING:
        return consumer.beginningOffsets(offsetsInfo.getNonEmptyPartitions());
      case OFFSET:
        Preconditions.checkNotNull(seekTo);
        return fixOffsets(offsetsInfo, seekTo);
      case TIMESTAMP:
        Preconditions.checkNotNull(seekTo);
        return offsetsForTimestamp(consumer, offsetsInfo, seekTo);
      default:
        throw new IllegalStateException();
    }
  }

  private static Map<TopicPartition, Long> fixOffsets(OffsetsInfo offsetsInfo, Map<TopicPartition, Long> offsets) {
    offsets = new HashMap<>(offsets);
    offsets.keySet().retainAll(offsetsInfo.getNonEmptyPartitions());

    Map<TopicPartition, Long> result = new HashMap<>();
    offsets.forEach((tp, targetOffset) -> {
      long endOffset = offsetsInfo.getEndOffsets().get(tp);
      long beginningOffset = offsetsInfo.getBeginOffsets().get(tp);
      // fixing offsets with min - max bounds
      if (targetOffset > endOffset) {
        targetOffset = endOffset;
      } else if (targetOffset < beginningOffset) {
        targetOffset = beginningOffset;
      }
      result.put(tp, targetOffset);
    });
    return result;
  }

  private static Map<TopicPartition, Long> offsetsForTimestamp(Consumer<?, ?> consumer, OffsetsInfo offsetsInfo,
                                                               Map<TopicPartition, Long> timestamps) {
    timestamps = new HashMap<>(timestamps);
    timestamps.keySet().retainAll(offsetsInfo.getNonEmptyPartitions());

    return consumer.offsetsForTimes(timestamps).entrySet().stream()
        .filter(e -> e.getValue() != null)
        .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().offset()));
  }
}
