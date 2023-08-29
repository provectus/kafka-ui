package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import jakarta.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

abstract class AbstractEmitter implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final MessagesProcessing messagesProcessing;
  private final PollingSettings pollingSettings;

  protected AbstractEmitter(MessagesProcessing messagesProcessing, PollingSettings pollingSettings) {
    this.messagesProcessing = messagesProcessing;
    this.pollingSettings = pollingSettings;
  }

  protected PolledRecords poll(FluxSink<TopicMessageEventDTO> sink, EnhancedConsumer consumer) {
    var records = consumer.pollEnhanced(pollingSettings.getPollTimeout());
    sendConsuming(sink, records);
    return records;
  }

  protected boolean isSendLimitReached() {
    return messagesProcessing.limitReached();
  }

  protected void send(FluxSink<TopicMessageEventDTO> sink,
                      Iterable<ConsumerRecord<Bytes, Bytes>> records,
                      @Nullable Cursor.Tracking cursor) {
    messagesProcessing.send(sink, records, cursor);
  }

  protected void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    messagesProcessing.sendPhase(sink, name);
  }

  protected void sendConsuming(FluxSink<TopicMessageEventDTO> sink, PolledRecords records) {
    messagesProcessing.sentConsumingInfo(sink, records);
  }

  // cursor is null if target partitions were fully polled (no, need to do paging)
  protected void sendFinishStatsAndCompleteSink(FluxSink<TopicMessageEventDTO> sink, @Nullable Cursor.Tracking cursor) {
    messagesProcessing.sendFinishEvents(sink, cursor);
    sink.complete();
  }
}
