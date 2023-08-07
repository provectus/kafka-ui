package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.Comparator;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.apache.kafka.common.TopicPartition;

public class BackwardEmitter extends RangePollingEmitter {

  public BackwardEmitter(Supplier<EnhancedConsumer> consumerSupplier,
                         ConsumerPosition consumerPosition,
                         int messagesPerPage,
                         ConsumerRecordDeserializer deserializer,
                         Predicate<TopicMessageDTO> filter,
                         PollingSettings pollingSettings) {
    super(
        consumerSupplier,
        consumerPosition,
        messagesPerPage,
        new MessagesProcessing(
            deserializer,
            filter,
            false,
            messagesPerPage
        ),
        pollingSettings
    );
  }

  @Override
  protected TreeMap<TopicPartition, FromToOffset> nextPollingRange(TreeMap<TopicPartition, FromToOffset> prevRange,
                                                                   SeekOperations seekOperations) {
    TreeMap<TopicPartition, Long> readToOffsets = new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
    if (prevRange.isEmpty()) {
      readToOffsets.putAll(seekOperations.getOffsetsForSeek());
    } else {
      readToOffsets.putAll(
          prevRange.entrySet()
              .stream()
              .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().from()))
      );
    }

    int msgsToPollPerPartition = (int) Math.ceil((double) messagesPerPage / readToOffsets.size());
    TreeMap<TopicPartition, FromToOffset> result = new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
    readToOffsets.forEach((tp, toOffset) -> {
      long tpStartOffset = seekOperations.getBeginOffsets().get(tp);
      if (toOffset > tpStartOffset) {
        result.put(tp, new FromToOffset(Math.max(tpStartOffset, toOffset - msgsToPollPerPartition), toOffset));
      }
    });
    return result;
  }
}
