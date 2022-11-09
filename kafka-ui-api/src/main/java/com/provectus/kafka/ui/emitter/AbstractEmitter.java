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
  private static final Duration DEFAULT_POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  // In some situations it is hard to say whether records range (between two offsets) was fully polled.
  // This happens when we have holes in records sequences that is usual case for compact topics or
  // topics with transactional writes. In such cases if you want to poll all records between offsets X and Y
  // there is no guarantee that you will ever see record with offset Y.
  // To workaround this we can assume that after N consecutive empty polls all target messages were read.
  public static final int NO_MORE_DATA_EMPTY_POLLS_COUNT = 3;

  private final ConsumerRecordDeserializer recordDeserializer;
  private final ConsumingStats consumingStats = new ConsumingStats();

  protected AbstractEmitter(ConsumerRecordDeserializer recordDeserializer) {
    this.recordDeserializer = recordDeserializer;
  }

  protected ConsumerRecords<Bytes, Bytes> poll(
      FluxSink<TopicMessageEventDTO> sink, Consumer<Bytes, Bytes> consumer) {
    return poll(sink, consumer, DEFAULT_POLL_TIMEOUT_MS);
  }

  protected ConsumerRecords<Bytes, Bytes> poll(
      FluxSink<TopicMessageEventDTO> sink, Consumer<Bytes, Bytes> consumer, Duration timeout) {
    Instant start = Instant.now();
    ConsumerRecords<Bytes, Bytes> records = consumer.poll(timeout);
    Instant finish = Instant.now();
    sendConsuming(sink, records, Duration.between(start, finish).toMillis());
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

  protected void sendConsuming(FluxSink<TopicMessageEventDTO> sink,
                               ConsumerRecords<Bytes, Bytes> records,
                               long elapsed) {
    consumingStats.sendConsumingEvt(sink, records, elapsed, getFilterApplyErrors(sink));
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