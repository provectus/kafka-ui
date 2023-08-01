package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.time.Duration;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter {

  private final MessagesProcessing messagesProcessing;
  protected final PollingSettings pollingSettings;

  protected AbstractEmitter(MessagesProcessing messagesProcessing, PollingSettings pollingSettings) {
    this.messagesProcessing = messagesProcessing;
    this.pollingSettings = pollingSettings;
  }

  protected PolledRecords poll(
      FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer) {
    return poll(sink, consumer, pollingSettings.getPollTimeout());
  }

  protected PolledRecords poll(FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer, Duration timeout) {
    var records = consumer.pollEnhanced(timeout);
    sendConsuming(sink, records);
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

  protected void sendConsuming(FluxSink<TopicMessageEventDTO> sink, PolledRecords records) {
    messagesProcessing.sentConsumingInfo(sink, records);
  }

  protected void sendFinishStatsAndCompleteSink(FluxSink<TopicMessageEventDTO> sink) {
    messagesProcessing.sendFinishEvent(sink);
    sink.complete();
  }
}
