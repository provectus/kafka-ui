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

public class ForwardEmitter extends RangePollingEmitter {

  public ForwardEmitter(Supplier<EnhancedConsumer> consumerSupplier,
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
            true,
            messagesPerPage
        ),
        pollingSettings
    );
  }

  @Override
  protected TreeMap<TopicPartition, FromToOffset> nextPollingRange(TreeMap<TopicPartition, FromToOffset> prevRange,
                                                                   SeekOperations seekOperations) {
    TreeMap<TopicPartition, Long> readFromOffsets = new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
    if (prevRange.isEmpty()) {
      readFromOffsets.putAll(seekOperations.getOffsetsForSeek());
    } else {
      readFromOffsets.putAll(
          prevRange.entrySet()
              .stream()
              .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().to()))
      );
    }

    int msgsToPollPerPartition = (int) Math.ceil((double) messagesPerPage / readFromOffsets.size());
    TreeMap<TopicPartition, FromToOffset> result = new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
    readFromOffsets.forEach((tp, fromOffset) -> {
      long tpEndOffset = seekOperations.getEndOffsets().get(tp);
      if (fromOffset < tpEndOffset) {
        result.put(tp, new FromToOffset(fromOffset, Math.min(tpEndOffset, fromOffset + msgsToPollPerPartition)));
      }
    });
    return result;
  }

}
