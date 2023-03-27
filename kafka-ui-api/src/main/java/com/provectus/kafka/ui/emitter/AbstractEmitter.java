package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.time.Duration;
import java.time.Instant;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter {

  private final ConsumerRecordDeserializer recordDeserializer;
  private final ConsumingStats consumingStats = new ConsumingStats();
  private final PollingThrottler throttler;
  protected final PollingSettings pollingSettings;

  protected AbstractEmitter(ConsumerRecordDeserializer recordDeserializer, PollingSettings pollingSettings) {
    this.recordDeserializer = recordDeserializer;
    this.pollingSettings = pollingSettings;
    this.throttler = pollingSettings.getPollingThrottler();
  }

  protected ConsumerRecords<Bytes, Bytes> poll(
      FluxSink<TopicMessageEventDTO> sink, Consumer<Bytes, Bytes> consumer) {
    return poll(sink, consumer, pollingSettings.getPollTimeout());
  }

  protected ConsumerRecords<Bytes, Bytes> poll(
      FluxSink<TopicMessageEventDTO> sink, Consumer<Bytes, Bytes> consumer, Duration timeout) {
    Instant start = Instant.now();
    ConsumerRecords<Bytes, Bytes> records = consumer.poll(timeout);
    Instant finish = Instant.now();
    int polledBytes = sendConsuming(sink, records, Duration.between(start, finish).toMillis());
    throttler.throttleAfterPoll(polledBytes);
    return records;
  }

  protected void sendMessage(FluxSink<TopicMessageEventDTO> sink,
                                                       ConsumerRecord<Bytes, Bytes> msg) {
    final TopicMessageDTO topicMessage = recordDeserializer.deserialize(msg);
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
            .message(topicMessage)
    );
  }

  protected void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.PHASE)
            .phase(new TopicMessagePhaseDTO().name(name))
    );
  }

  protected int sendConsuming(FluxSink<TopicMessageEventDTO> sink,
                               ConsumerRecords<Bytes, Bytes> records,
                               long elapsed) {
    return consumingStats.sendConsumingEvt(sink, records, elapsed, getFilterApplyErrors(sink));
  }

  protected void sendFinishStatsAndCompleteSink(FluxSink<TopicMessageEventDTO> sink) {
    consumingStats.sendFinishEvent(sink, getFilterApplyErrors(sink));
    sink.complete();
  }

  protected Number getFilterApplyErrors(FluxSink<?> sink) {
    return sink.contextView()
        .<MessageFilterStats>getOrEmpty(MessageFilterStats.class)
        .<Number>map(MessageFilterStats::getFilterApplyErrors)
        .orElse(0);
  }
}
