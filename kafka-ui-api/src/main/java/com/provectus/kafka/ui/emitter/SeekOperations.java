package com.provectus.kafka.ui.emitter;

import static com.provectus.kafka.ui.model.PollingModeDTO.TO_TIMESTAMP;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.PollingModeDTO;
import java.util.HashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;

@RequiredArgsConstructor(access = AccessLevel.PACKAGE)
class SeekOperations {

  private final Consumer<?, ?> consumer;
  private final OffsetsInfo offsetsInfo;
  private final Map<TopicPartition, Long> offsetsForSeek; //only contains non-empty partitions!

  static SeekOperations create(Consumer<?, ?> consumer, ConsumerPosition consumerPosition) {
    OffsetsInfo offsetsInfo;
    if (consumerPosition.partitions().isEmpty()) {
      offsetsInfo = new OffsetsInfo(consumer, consumerPosition.topic());
    } else {
      offsetsInfo = new OffsetsInfo(consumer, consumerPosition.partitions());
    }
    return new SeekOperations(
        consumer,
        offsetsInfo,
        getOffsetsForSeek(consumer, offsetsInfo, consumerPosition)
    );
  }

  void assignAndSeekNonEmptyPartitions() {
    consumer.assign(offsetsForSeek.keySet());
    offsetsForSeek.forEach(consumer::seek);
  }

  Map<TopicPartition, Long> getBeginOffsets() {
    return offsetsInfo.getBeginOffsets();
  }

  Map<TopicPartition, Long> getEndOffsets() {
    return offsetsInfo.getEndOffsets();
  }

  boolean assignedPartitionsFullyPolled() {
    return offsetsInfo.assignedPartitionsFullyPolled();
  }

  // Get offsets to seek to. NOTE: offsets do not contain empty partitions offsets
  Map<TopicPartition, Long> getOffsetsForSeek() {
    return offsetsForSeek;
  }

  /**
   * Finds offsets for ConsumerPosition. Note: will return empty map if no offsets found for desired criteria.
   */
  @VisibleForTesting
  static Map<TopicPartition, Long> getOffsetsForSeek(Consumer<?, ?> consumer,
                                                     OffsetsInfo offsetsInfo,
                                                     ConsumerPosition position) {
    switch (position.pollingMode()) {
      case LATEST, TAILING:
        return consumer.endOffsets(offsetsInfo.getNonEmptyPartitions());
      case EARLIEST:
        return consumer.beginningOffsets(offsetsInfo.getNonEmptyPartitions());
      case FROM_OFFSET, TO_OFFSET:
        Preconditions.checkNotNull(position.offsets());
        return fixOffsets(offsetsInfo, position.offsets());
      case FROM_TIMESTAMP, TO_TIMESTAMP:
        Preconditions.checkNotNull(position.timestamp());
        return offsetsForTimestamp(consumer, position.pollingMode(), offsetsInfo, position.timestamp());
      default:
        throw new IllegalStateException();
    }
  }

  private static Map<TopicPartition, Long> fixOffsets(OffsetsInfo offsetsInfo,
                                                      ConsumerPosition.Offsets positionOffset) {
    var offsets = new HashMap<TopicPartition, Long>();
    if (positionOffset.offset() != null) {
      offsetsInfo.getNonEmptyPartitions().forEach(tp -> offsets.put(tp, positionOffset.offset()));
    } else {
      Preconditions.checkNotNull(positionOffset.tpOffsets());
      offsets.putAll(positionOffset.tpOffsets());
      offsets.keySet().retainAll(offsetsInfo.getNonEmptyPartitions());
    }

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

  private static Map<TopicPartition, Long> offsetsForTimestamp(Consumer<?, ?> consumer,
                                                               PollingModeDTO pollingMode,
                                                               OffsetsInfo offsetsInfo,
                                                               Long timestamp) {
    Map<TopicPartition, Long> timestamps = new HashMap<>();
    offsetsInfo.getNonEmptyPartitions().forEach(tp -> timestamps.put(tp, timestamp));

    Map<TopicPartition, Long> result = new HashMap<>();
    consumer.offsetsForTimes(timestamps).forEach((tp, offsetAndTimestamp) -> {
      if (offsetAndTimestamp == null) {
        if (pollingMode == TO_TIMESTAMP && offsetsInfo.getNonEmptyPartitions().contains(tp)) {
          // if no offset was returned this means that *all* timestamps are lower
          // than target timestamp. Is case of TO_OFFSET mode we need to read from the ending of tp
          result.put(tp, offsetsInfo.getEndOffsets().get(tp));
        }
      } else {
        result.put(tp, offsetAndTimestamp.offset());
      }
    });
    return result;
  }
}
