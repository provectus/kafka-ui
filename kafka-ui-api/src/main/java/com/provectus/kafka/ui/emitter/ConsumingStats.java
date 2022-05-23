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
                        long elapsed) {
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
    final TopicMessageConsumingDTO consuming = new TopicMessageConsumingDTO()
        .bytesConsumed(this.bytes)
        .elapsedMs(this.elapsed)
        .isCancelled(sink.isCancelled())
        .messagesConsumed(this.records);
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.CONSUMING)
            .consuming(consuming)
    );
  }
}
