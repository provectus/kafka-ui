package com.provectus.kafka.ui.emitter;

import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
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
    private final Function<Cursor, String> registerAction;

    //topic -> partition -> offset
    private final Table<String, Integer, Long> trackingOffsets = HashBasedTable.create();

    public Tracking(ConsumerRecordDeserializer deserializer,
                    ConsumerPosition originalPosition,
                    Predicate<TopicMessageDTO> filter,
                    int limit,
                    Function<Cursor, String> registerAction) {
      this.deserializer = deserializer;
      this.originalPosition = originalPosition;
      this.filter = filter;
      this.limit = limit;
      this.registerAction = registerAction;
    }

    void trackOffset(String topic, int partition, long offset) {
      trackingOffsets.put(topic, partition, offset);
    }

    void initOffsets(Map<TopicPartition, Long> initialSeekOffsets) {
      initialSeekOffsets.forEach((tp, off) -> trackOffset(tp.topic(), tp.partition(), off));
    }

    private Map<TopicPartition, Long> getOffsetsMap(int offsetToAdd) {
      Map<TopicPartition, Long> result = new HashMap<>();
      trackingOffsets.rowMap()
          .forEach((topic, partsMap) ->
              partsMap.forEach((p, off) -> result.put(new TopicPartition(topic, p), off + offsetToAdd)));
      return result;
    }

    String registerCursor() {
      return registerAction.apply(
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
                  new ConsumerPosition.Offsets(
                      null,
                      getOffsetsMap(
                          switch (originalPosition.pollingMode()) {
                            case TO_OFFSET, TO_TIMESTAMP, LATEST -> 0;
                            // when doing forward polling we need to start from latest msg's offset + 1
                            case FROM_OFFSET, FROM_TIMESTAMP, EARLIEST -> 1;
                            case TAILING -> throw new IllegalStateException();
                          }
                      )
                  )
              ),
              filter,
              limit
          )
      );
    }
  }

}
