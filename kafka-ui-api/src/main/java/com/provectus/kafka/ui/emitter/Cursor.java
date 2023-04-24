package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.PollingModeDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import org.apache.kafka.common.TopicPartition;

public record Cursor(ConsumerRecordDeserializer deserializer,
                     ConsumerPosition consumerPosition,
                     Predicate<TopicMessageDTO> filter,
                     int limit) {

  public static class Tracking {
    private final ConsumerRecordDeserializer deserializer;
    private final ConsumerPosition originalPosition;
    private final Predicate<TopicMessageDTO> filter;
    private final int limit;
    private final Function<Cursor, String> cursorRegistry;

    private final Map<TopicPartition, Long> trackingOffsets = new HashMap<>();

    public Tracking(ConsumerRecordDeserializer deserializer,
                    ConsumerPosition originalPosition,
                    Predicate<TopicMessageDTO> filter,
                    int limit,
                    Function<Cursor, String> cursorRegistry) {
      this.deserializer = deserializer;
      this.originalPosition = originalPosition;
      this.filter = filter;
      this.limit = limit;
      this.cursorRegistry = cursorRegistry;
    }

    void trackOffset(TopicPartition tp, long offset) {
      trackingOffsets.put(tp, offset);
    }

    void trackOffsets(Map<TopicPartition, Long> offsets) {
      this.trackingOffsets.putAll(offsets);
    }

    String registerCursor() {
      return cursorRegistry.apply(
          new Cursor(
              deserializer,
              new ConsumerPosition(
                  switch (originalPosition.pollingMode()) {
                    case TO_OFFSET, TO_TIMESTAMP, LATEST -> PollingModeDTO.TO_OFFSET;
                    case FROM_OFFSET, FROM_TIMESTAMP, EARLIEST -> PollingModeDTO.FROM_OFFSET;
                    case TAILING -> throw new IllegalStateException();
                  },
                  originalPosition.topic(),
                  originalPosition.partitions(),
                  null,
                  new ConsumerPosition.Offsets(null, trackingOffsets)
              ),
              filter,
              limit
          )
      );
    }
  }

}
