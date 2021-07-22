package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.model.TopicMessageConsuming;
import com.provectus.kafka.ui.model.TopicMessageEvent;
import com.provectus.kafka.ui.model.TopicMessagePhase;
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
      FluxSink<TopicMessageEvent> sink, Consumer<Bytes, Bytes> consumer) {
    Instant start = Instant.now();
    ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
    Instant finish = Instant.now();
    sendConsuming(sink, records, Duration.between(start, finish).toMillis());
    return records;
  }

  protected FluxSink<TopicMessageEvent> sendMessage(FluxSink<TopicMessageEvent> sink,
                             ConsumerRecord<Bytes, Bytes> msg) {
    final TopicMessage topicMessage = ClusterUtil.mapToTopicMessage(msg, recordDeserializer);
    return sink.next(
        new TopicMessageEvent()
            .type(TopicMessageEvent.TypeEnum.MESSAGE)
            .message(topicMessage)
    );
  }

  protected void sendPhase(FluxSink<TopicMessageEvent> sink, String name) {
    sink.next(
        new TopicMessageEvent()
          .type(TopicMessageEvent.TypeEnum.PHASE)
          .phase(new TopicMessagePhase().name(name))
    );
  }

  protected void sendConsuming(FluxSink<TopicMessageEvent> sink,
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
    final TopicMessageConsuming consuming = new TopicMessageConsuming()
        .bytesConsumed(this.bytes)
        .elapsedMs(this.elapsed)
        .isCancelled(sink.isCancelled())
        .messagesConsumed(this.records);
    sink.next(
        new TopicMessageEvent()
            .type(TopicMessageEvent.TypeEnum.CONSUMING)
            .consuming(consuming)
    );
  }
}