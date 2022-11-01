package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageConsumingDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

class ConsumingStats {

  private long bytes = 0;
  private int records = 0;
  private long elapsed = 0;

  void sendConsumingEvt(FluxSink<TopicMessageEventDTO> sink,
                        ConsumerRecords<Bytes, Bytes> polledRecords,
                        long elapsed,
                        Number filterApplyErrors) {
    for (ConsumerRecord<Bytes, Bytes> rec : polledRecords) {
      for (Header header : rec.headers()) {
        bytes +=
            (header.key() != null ? header.key().getBytes().length : 0L)
                + (header.value() != null ? header.value().length : 0L);
      }
      bytes += rec.serializedKeySize() + rec.serializedValueSize();
    }
    this.records += polledRecords.count();
    this.elapsed += elapsed;
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.CONSUMING)
            .consuming(createConsumingStats(sink, filterApplyErrors))
    );
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink, Number filterApplyErrors) {
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.DONE)
            .consuming(createConsumingStats(sink, filterApplyErrors))
    );
  }

  private TopicMessageConsumingDTO createConsumingStats(FluxSink<TopicMessageEventDTO> sink,
                                                        Number filterApplyErrors) {
    return new TopicMessageConsumingDTO()
        .bytesConsumed(this.bytes)
        .elapsedMs(this.elapsed)
        .isCancelled(sink.isCancelled())
        .filterApplyErrors(filterApplyErrors.intValue())
        .messagesConsumed(this.records);
  }
}
