package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageConsumingDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessageNextPageCursorDTO;
import javax.annotation.Nullable;
import reactor.core.publisher.FluxSink;

class ConsumingStats {

  private long bytes = 0;
  private int records = 0;
  private long elapsed = 0;
  private int filterApplyErrors = 0;

  void sendConsumingEvt(FluxSink<TopicMessageEventDTO> sink, PolledRecords polledRecords) {
    bytes += polledRecords.bytes();
    records += polledRecords.count();
    elapsed += polledRecords.elapsed().toMillis();
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.CONSUMING)
            .consuming(createConsumingStats())
    );
  }

  void incFilterApplyError() {
    filterApplyErrors++;
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink, @Nullable Cursor.Tracking cursor) {
    sink.next(
        new TopicMessageEventDTO()
            .type(TopicMessageEventDTO.TypeEnum.DONE)
            .cursor(
                cursor != null
                    ? new TopicMessageNextPageCursorDTO().id(cursor.registerCursor())
                    : null
            )
            .consuming(createConsumingStats())
    );
  }

  private TopicMessageConsumingDTO createConsumingStats() {
    return new TopicMessageConsumingDTO()
        .bytesConsumed(bytes)
        .elapsedMs(elapsed)
        .isCancelled(false)
        .filterApplyErrors(filterApplyErrors)
        .messagesConsumed(records);
  }
}
