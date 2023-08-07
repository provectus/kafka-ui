package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class MessagesProcessing {

  private final ConsumingStats consumingStats = new ConsumingStats();
  private final List<TopicMessageDTO> buffer = new ArrayList<>();

  private long sentMessages = 0;
  private int filterApplyErrors = 0;
  private final ConsumerRecordDeserializer deserializer;
  private final Predicate<TopicMessageDTO> filter;
  private final @Nullable Integer limit;

  public MessagesProcessing(ConsumerRecordDeserializer deserializer,
                            Predicate<TopicMessageDTO> filter,
                            @Nullable Integer limit) {
    this.deserializer = deserializer;
    this.filter = filter;
    this.limit = limit;
  }

  boolean limitReached() {
    return limit != null && sentMessages >= limit;
  }

  void buffer(ConsumerRecord<Bytes, Bytes> rec) {
    if (!limitReached()) {
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

  void flush(FluxSink<TopicMessageEventDTO> sink, Comparator<TopicMessageDTO> sortBeforeSend) {
    while (!sink.isCancelled()) {
      buffer.sort(sortBeforeSend);
      for (TopicMessageDTO topicMessage : buffer) {
        sink.next(
            new TopicMessageEventDTO()
                .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
                .message(topicMessage)
        );
      }
    }
    buffer.clear();
  }

  void sendWithoutBuffer(FluxSink<TopicMessageEventDTO> sink, ConsumerRecord<Bytes, Bytes> rec) {
    buffer(rec);
    flush(sink, (m1, m2) -> 0);
  }

  void sentConsumingInfo(FluxSink<TopicMessageEventDTO> sink, PolledRecords polledRecords) {
    if (!sink.isCancelled()) {
      consumingStats.sendConsumingEvt(sink, polledRecords, filterApplyErrors);
    }
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    if (!sink.isCancelled()) {
      consumingStats.sendFinishEvent(sink, filterApplyErrors);
    }
  }

  void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    if (!sink.isCancelled()) {
      sink.next(
          new TopicMessageEventDTO()
              .type(TopicMessageEventDTO.TypeEnum.PHASE)
              .phase(new TopicMessagePhaseDTO().name(name))
      );
    }
  }

}
