package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeek;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class TailingEmitter extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeek offsetsSeek;

  public TailingEmitter(RecordSerDe recordDeserializer,
                        Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
                        OffsetsSeek offsetsSeek) {
    super(recordDeserializer);
    this.consumerSupplier = consumerSupplier;
    this.offsetsSeek = offsetsSeek;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      log.debug("Starting topic tailing");
      offsetsSeek.assignAndSeek(consumer);
      while (!sink.isCancelled()) {
        sendPhase(sink, "Polling");
        var polled = poll(sink, consumer);
        polled.forEach(r -> sendMessage(sink, r));
      }
      sink.complete();
      log.debug("Tailing finished");
    } catch (InterruptException kafkaInterruptException) {
      sink.complete();
    } catch (Exception e) {
      log.error("Error consuming {}", offsetsSeek.getConsumerPosition(), e);
      sink.error(e);
    }
  }

}
