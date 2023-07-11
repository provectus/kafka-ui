package com.provectus.kafka.ui.model;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.exception.ValidationException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.apache.kafka.common.TopicPartition;

public record ConsumerPosition(PollingModeDTO pollingMode,
                               String topic,
                               List<TopicPartition> partitions, //all partitions if list is empty
                               @Nullable Long timestamp,
                               @Nullable Offsets offsets) {

  public record Offsets(@Nullable Long offset, //should be applied to all partitions
                        @Nullable Map<TopicPartition, Long> tpOffsets) {
    public Offsets {
      // only one of properties should be set
      Preconditions.checkArgument((offset == null && tpOffsets != null) || (offset != null && tpOffsets == null));
    }
  }

  public static ConsumerPosition create(PollingModeDTO pollingMode,
                                        String topic,
                                        @Nullable List<Integer> partitions,
                                        @Nullable Long timestamp,
                                        @Nullable Long offset) {
    @Nullable var offsets = parseAndValidateOffsets(pollingMode, offset);

    var topicPartitions = Optional.ofNullable(partitions).orElse(List.of())
        .stream()
        .map(p -> new TopicPartition(topic, p))
        .collect(Collectors.toList());

    // if offsets are specified - inferring partitions list from there
    topicPartitions = (offsets != null && offsets.tpOffsets() != null)
        ? List.copyOf(offsets.tpOffsets().keySet())
        : topicPartitions;

    return new ConsumerPosition(
        pollingMode,
        topic,
        topicPartitions,
        validateTimestamp(pollingMode, timestamp),
        offsets
    );
  }

  private static Long validateTimestamp(PollingModeDTO pollingMode, @Nullable Long ts) {
    if (pollingMode == PollingModeDTO.FROM_TIMESTAMP || pollingMode == PollingModeDTO.TO_TIMESTAMP) {
      if (ts == null) {
        throw new ValidationException("timestamp not provided for " + pollingMode);
      }
    }
    return ts;
  }

  private static Offsets parseAndValidateOffsets(PollingModeDTO pollingMode,
                                                 @Nullable Long offset) {
    if (pollingMode == PollingModeDTO.FROM_OFFSET || pollingMode == PollingModeDTO.TO_OFFSET) {
      if (offset == null) {
        throw new ValidationException("offsets not provided for " + pollingMode);
      }
      return new Offsets(offset, null);
    }
    return null;
  }

}
