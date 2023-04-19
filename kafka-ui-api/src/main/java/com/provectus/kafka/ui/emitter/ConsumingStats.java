package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageConsumingDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.util.ConsumerRecordsUtil;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

class ConsumingStats {

  private long bytes = 0;
  private int records = 0;
  private long elapsed = 0;

  /**
   * returns bytes polled.
   */
  int sendConsumingEvt(FluxSink<TopicMessageEventDTO> sink,
                        ConsumerRecords<Bytes, Bytes> polledRecords,
                        long elapsed,
                        int filterApplyErrors) {
    int polledBytes = ConsumerRecordsUtil.calculatePolledSize(polledRecords);
    bytes += polledBytes;
    this.records += polledRecords.count();
    this.elapsed += elapsed;
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.CONSUMING)
            .consuming(createConsumingStats(sink, filterApplyErrors))
    );
    return polledBytes;
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink, int filterApplyErrors) {
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.DONE)
            .consuming(createConsumingStats(sink, filterApplyErrors))
    );
  }

  private TopicMessageConsumingDTO createConsumingStats(FluxSink<TopicMessageEventDTO> sink,
                                                        int filterApplyErrors) {
    return new TopicMessageConsumingDTO()
        .bytesConsumed(this.bytes)
        .elapsedMs(this.elapsed)
        .isCancelled(sink.isCancelled())
        .filterApplyErrors(filterApplyErrors)
        .messagesConsumed(this.records);
  }
}
