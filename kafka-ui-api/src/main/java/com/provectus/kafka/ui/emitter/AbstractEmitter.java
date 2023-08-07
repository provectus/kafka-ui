package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.time.Duration;
import java.util.Comparator;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final MessagesProcessing messagesProcessing;
  private final PollingSettings pollingSettings;

  protected AbstractEmitter(MessagesProcessing messagesProcessing, PollingSettings pollingSettings) {
    this.messagesProcessing = messagesProcessing;
    this.pollingSettings = pollingSettings;
  }

  private PolledRecords poll(FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer, Duration timeout) {
    var records = consumer.pollEnhanced(timeout);
    sendConsuming(sink, records);
    return records;
  }

  protected PolledRecords poll(FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer) {
    return poll(sink, consumer, pollingSettings.getPollTimeout());
  }

  protected PolledRecords pollSinglePartition(FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer) {
    return poll(sink, consumer, pollingSettings.getPartitionPollTimeout());
  }

  protected void buffer(ConsumerRecord<Bytes, Bytes> rec) {
    messagesProcessing.buffer(rec);
  }

  protected void flushBuffer(FluxSink<TopicMessageEventDTO> sink) {
    messagesProcessing.flush(sink);
  }

  protected void sendWithoutBuffer(FluxSink<TopicMessageEventDTO> sink, ConsumerRecord<Bytes, Bytes> rec) {
    messagesProcessing.sendWithoutBuffer(sink, rec);
  }

  protected boolean sendLimitReached() {
    return messagesProcessing.limitReached();
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
