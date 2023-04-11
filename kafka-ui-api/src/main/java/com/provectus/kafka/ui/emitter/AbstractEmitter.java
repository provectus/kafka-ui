package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.time.Duration;
import java.time.Instant;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter {

  private final MessagesProcessing messagesProcessing;
  private final PollingThrottler throttler;
  protected final PollingSettings pollingSettings;

  protected AbstractEmitter(MessagesProcessing messagesProcessing, PollingSettings pollingSettings) {
    this.messagesProcessing = messagesProcessing;
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

  protected boolean sendLimitReached() {
    return messagesProcessing.limitReached();
  }

  protected void sendMessage(FluxSink<TopicMessageEventDTO> sink,
                             ConsumerRecord<Bytes, Bytes> msg) {
    messagesProcessing.sendMsg(sink, msg);
  }

  protected void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    messagesProcessing.sendPhase(sink, name);
  }

  protected int sendConsuming(FluxSink<TopicMessageEventDTO> sink,
                              ConsumerRecords<Bytes, Bytes> records,
                              long elapsed) {
    return messagesProcessing.sentConsumingInfo(sink, records, elapsed);
  }

  protected void sendFinishStatsAndCompleteSink(FluxSink<TopicMessageEventDTO> sink) {
    messagesProcessing.sendFinishEvent(sink);
    sink.complete();
  }
}
