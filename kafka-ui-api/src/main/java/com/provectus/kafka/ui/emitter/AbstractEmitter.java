package com.provectus.kafka.ui.emitter;

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
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

public abstract class AbstractEmitter {
  private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  private final RecordSerDe recordDeserializer;
  private final ConsumingStats consumingStats = new ConsumingStats();

  protected AbstractEmitter(RecordSerDe recordDeserializer) {
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

  protected void sendMessage(FluxSink<TopicMessageEventDTO> sink,
                                                       ConsumerRecord<Bytes, Bytes> msg) {
    final TopicMessageDTO topicMessage = ClusterUtil.mapToTopicMessage(msg, recordDeserializer);
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
    consumingStats.sendConsumingEvt(sink, records, elapsed);
  }
}