package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.Lombok;
import org.apache.kafka.common.TopicPartition;

public class ForwardPartitionsEmitterImpl extends AbstractPartitionsEmitter {

  public ForwardPartitionsEmitterImpl(
      Supplier<EnhancedConsumer> consumerSupplier,
      ConsumerPosition consumerPosition,
      int messagesPerPage,
      MessagesProcessing messagesProcessing,
      PollingSettings pollingSettings
  ) {
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
