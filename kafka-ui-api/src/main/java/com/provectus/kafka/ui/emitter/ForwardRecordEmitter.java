package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeek;
import java.time.Duration;
import java.time.Instant;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeek offsetsSeek;

  public ForwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      OffsetsSeek offsetsSeek,
      RecordSerDe recordDeserializer) {
    super(recordDeserializer);
    this.consumerSupplier = consumerSupplier;
    this.offsetsSeek = offsetsSeek;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var waitingOffsets = offsetsSeek.assignAndSeek(consumer);
      while (!sink.isCancelled() && !waitingOffsets.endReached()) {
        sendPhase(sink, "Polling");
        ConsumerRecords<Bytes, Bytes> records = poll(sink, consumer);
        log.info("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          if (!sink.isCancelled() && !waitingOffsets.endReached()) {
            sendMessage(sink, msg);
            waitingOffsets.markPolled(msg);
          } else {
            break;
          }
        }
      }
      sink.complete();
      log.info("Polling finished");
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }
}
