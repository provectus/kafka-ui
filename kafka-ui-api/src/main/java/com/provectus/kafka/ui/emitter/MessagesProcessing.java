package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class MessagesProcessing {

  private final ConsumingStats consumingStats = new ConsumingStats();
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

  public boolean limitReached() {
    return limit != null && sentMessages >= limit;
  }

  void sendMsg(FluxSink<TopicMessageEventDTO> sink, ConsumerRecord<Bytes, Bytes> rec) {
    if (!sink.isCancelled() && !limitReached()) {
      TopicMessageDTO topicMessage = deserializer.deserialize(rec);
      try {
        if (filter.test(topicMessage)) {
          sink.next(
              new TopicMessageEventDTO()
                  .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
                  .message(topicMessage)
          );
          sentMessages++;
        }
      } catch (Exception e) {
        filterApplyErrors++;
        log.trace("Error applying filter for message {}", topicMessage);
      }
    }
  }

  int sentConsumingInfo(FluxSink<TopicMessageEventDTO> sink,
                        ConsumerRecords<Bytes, Bytes> polledRecords,
                        long elapsed) {
    if (!sink.isCancelled()) {
      return consumingStats.sendConsumingEvt(sink, polledRecords, elapsed, filterApplyErrors);
    }
    return 0;
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    if (!sink.isCancelled()) {
      consumingStats.sendFinishEvent(sink, filterApplyErrors);
    }
  }

  protected void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    if (!sink.isCancelled()) {
      sink.next(
          new TopicMessageEventDTO()
              .type(TopicMessageEventDTO.TypeEnum.PHASE)
              .phase(new TopicMessagePhaseDTO().name(name))
      );
    }
  }

}
