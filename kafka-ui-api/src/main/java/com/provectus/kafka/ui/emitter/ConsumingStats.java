package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageConsumingDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import reactor.core.publisher.FluxSink;

class ConsumingStats {

  private long bytes = 0;
  private int records = 0;
  private long elapsed = 0;
  private int filterApplyErrors = 0;

  void sendConsumingEvt(FluxSink<TopicMessageEventDTO> sink, PolledRecords polledRecords) {
    bytes += polledRecords.bytes();
    this.records += polledRecords.count();
    this.elapsed += polledRecords.elapsed().toMillis();
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.CONSUMING)
            .consuming(createConsumingStats(sink))
    );
  }

  void incFilterApplyError() {
    filterApplyErrors++;
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.DONE)
            .consuming(createConsumingStats(sink))
    );
  }

  private TopicMessageConsumingDTO createConsumingStats(FluxSink<TopicMessageEventDTO> sink) {
    return new TopicMessageConsumingDTO()
        .bytesConsumed(this.bytes)
        .elapsedMs(this.elapsed)
        .isCancelled(sink.isCancelled())
        .filterApplyErrors(filterApplyErrors)
        .messagesConsumed(this.records);
  }
}
