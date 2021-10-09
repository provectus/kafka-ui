package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageConsumingDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.time.Duration;
import java.time.Instant;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter {
  private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  private final RecordSerDe recordDeserializer;
  private long bytes = 0;
  private int records = 0;
  private long elapsed = 0;

  public AbstractEmitter(RecordSerDe recordDeserializer) {
    this.recordDeserializer = recordDeserializer;
  }

  protected ConsumerRecords<Bytes, Bytes> poll(
      FluxSink<TopicMessageEventDTO> sink, Consumer<Bytes, Bytes> consumer) {
    Instant start = Instant.now();
    ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
    Instant finish = Instant.now();
    sendConsuming(sink, records, Duration.between(start, finish).toMillis());
    return records;
  }

  protected FluxSink<TopicMessageEventDTO> sendMessage(FluxSink<TopicMessageEventDTO> sink,
                             ConsumerRecord<Bytes, Bytes> msg) {
    final TopicMessageDTO topicMessage = ClusterUtil.mapToTopicMessage(msg, recordDeserializer);
    return sink.next(
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
    for (ConsumerRecord<Bytes, Bytes> record : records) {
      for (Header header : record.headers()) {
        bytes +=
            (header.key() != null ? header.key().getBytes().length : 0L)
            + (header.value() != null ? header.value().length : 0L);
      }
      bytes += record.serializedKeySize() + record.serializedValueSize();
    }
    this.records += records.count();
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