package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.jetbrains.annotations.Nullable;
import reactor.core.publisher.FluxSink;

@Slf4j
public class TimestampsSortedMessageProcessing extends MessagesProcessing {

  private final List<TopicMessageDTO> buffer = new ArrayList<>();

  public TimestampsSortedMessageProcessing(ConsumerRecordDeserializer deserializer,
                                           Predicate<TopicMessageDTO> filter,
                                           @Nullable Integer limit) {
    super(deserializer, filter, limit);
  }

  @Override
  void sendMsg(FluxSink<TopicMessageEventDTO> sink, ConsumerRecord<Bytes, Bytes> rec) {
    if (!sink.isCancelled() && !limitReached()) {
      TopicMessageDTO topicMessage = deserializer.deserialize(rec);
      try {
        if (filter.test(topicMessage)) {
          buffer.add(topicMessage);
          sentMessages++;
        }
      } catch (Exception e) {
        filterApplyErrors++;
        log.trace("Error applying filter for message {}", topicMessage);
      }
    }
  }

  @Override
  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    flush(sink);
    super.sendFinishEvent(sink);
  }

  void flush(FluxSink<TopicMessageEventDTO> sink) {
    sorted(buffer)
        .forEach(topicMessage ->
            sink.next(
                new TopicMessageEventDTO()
                    .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
                    .message(topicMessage)));
    buffer.clear();
  }

  static Stream<TopicMessageDTO> sorted(List<TopicMessageDTO> messages) {
    return messages.stream()
        .sorted(Comparator.comparingLong(TopicMessageDTO::getOffset).reversed())
        .sorted(Comparator.comparingInt(TopicMessageDTO::getPartition))
        .sorted((m1, m2) -> {
          if (m1.getPartition().equals(m2.getPartition())) {
            return 0; //sorting is stable, so it will just keep messages in same order
          }
          return -m1.getTimestamp().compareTo(m2.getTimestamp());
        });
  }
}
