package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.util.OffsetsSeek;
import java.time.Duration;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@RequiredArgsConstructor
@Log4j2
public class ForwardRecordEmitter
    implements java.util.function.Consumer<FluxSink<ConsumerRecord<Bytes, Bytes>>> {

  private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeek offsetsSeek;

  @Override
  public void accept(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      var waitingOffsets = offsetsSeek.assignAndSeek(consumer);
      while (!sink.isCancelled() && !waitingOffsets.endReached()) {
        ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
        log.info("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          if (!sink.isCancelled() && !waitingOffsets.endReached()) {
            sink.next(msg);
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
