package com.provectus.kafka.ui.model;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.exception.ValidationException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.kafka.common.TopicPartition;
import org.springframework.util.StringUtils;


public record ConsumerPosition(PollingModeDTO pollingMode,
                               String topic,
                               List<TopicPartition> partitions, //all partitions if list is empty
                               @Nullable Long timestamp,
                               @Nullable Offsets offsets) {

  public record Offsets(@Nullable Long offset,
                        @Nullable Map<TopicPartition, Long> tpOffsets) {
  }

  public static ConsumerPosition create(PollingModeDTO pollingMode,
                                        String topic,
                                        @Nullable List<Integer> partitions,
                                        @Nullable Long timestamp,
                                        @Nullable String offsetsStr) {
    Offsets offsets = parseAndValidateOffsets(pollingMode, topic, offsetsStr);

    var topicPartitions = Optional.ofNullable(partitions).orElse(List.of())
        .stream()
        .map(p -> new TopicPartition(topic, p))
        .collect(Collectors.toList());

    // if offsets are specified -inferring partitions list from there
    topicPartitions = offsets.tpOffsets == null ? topicPartitions : List.copyOf(offsets.tpOffsets.keySet());

    return new ConsumerPosition(
        pollingMode,
        topic,
        Optional.ofNullable(topicPartitions).orElse(List.of()),
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
                                                 String topic,
                                                 @Nullable String offsetsStr) {
    Offsets offsets = null;
    if (pollingMode == PollingModeDTO.FROM_OFFSET || pollingMode == PollingModeDTO.TO_OFFSET) {
      if (!StringUtils.hasText(offsetsStr)) {
        throw new ValidationException("offsets not provided for " + pollingMode);
      }
      if (offsetsStr.contains(":")) {
        offsets = new Offsets(Long.parseLong(offsetsStr), null);
      } else {
        Map<TopicPartition, Long> tpOffsets = Stream.of(offsetsStr.split(","))
            .map(p -> {
              String[] split = p.split(":");
              if (split.length != 2) {
                throw new IllegalArgumentException(
                    "Wrong seekTo argument format. See API docs for details");
              }
              return Pair.of(
                  new TopicPartition(topic, Integer.parseInt(split[0])),
                  Long.parseLong(split[1])
              );
            })
            .collect(toMap(Pair::getKey, Pair::getValue));
        offsets = new Offsets(null, tpOffsets);
      }
    }
    return offsets;
  }

}
