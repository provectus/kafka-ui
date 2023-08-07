package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import java.util.Comparator;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.apache.kafka.common.TopicPartition;

public class BackwardPartitionsEmitterImpl extends AbstractPartitionsEmitter {


  public BackwardPartitionsEmitterImpl(Supplier<EnhancedConsumer> consumerSupplier,
                                       ConsumerPosition consumerPosition,
                                       int messagesPerPage,
                                       MessagesProcessing messagesProcessing,
                                       PollingSettings pollingSettings) {
    super(consumerSupplier, consumerPosition, messagesPerPage, messagesProcessing, pollingSettings);
  }

  @Override
  protected Comparator<TopicMessageDTO> sortBeforeSend() {
    return (m1, m2) -> 0;
  }

  @Override
  protected TreeMap<TopicPartition, FromToOffset> nexPollingRange(EnhancedConsumer consumer,
                                                                  TreeMap<TopicPartition, FromToOffset> prevRange,
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
      long tpStartOffset = seekOperations.getOffsetsForSeek().get(tp);
      if (toOffset > tpStartOffset) {
        result.put(tp, new FromToOffset(toOffset, Math.min(tpStartOffset, toOffset - msgsToPollPerPartition)));
      }
    });
    return result;
  }
}
