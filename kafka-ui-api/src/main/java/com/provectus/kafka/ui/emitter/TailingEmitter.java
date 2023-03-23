package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.HashMap;
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
  private final ConsumerPosition consumerPosition;

  public TailingEmitter(Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
                        ConsumerPosition consumerPosition,
                        ConsumerRecordDeserializer recordDeserializer,
                        PollingSettings pollingSettings) {
    super(recordDeserializer, pollingSettings);
    this.consumerSupplier = consumerSupplier;
    this.consumerPosition = consumerPosition;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting tailing polling for {}", consumerPosition);
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      assignAndSeek(consumer);
      while (!sink.isCancelled()) {
        sendPhase(sink, "Polling");
        var polled = poll(sink, consumer);
        polled.forEach(r -> sendMessage(sink, r));
      }
      sink.complete();
      log.debug("Tailing finished");
    } catch (InterruptException kafkaInterruptException) {
      log.debug("Tailing finished due to thread interruption");
      sink.complete();
    } catch (Exception e) {
      log.error("Error consuming {}", consumerPosition, e);
      sink.error(e);
    }
  }

  private void assignAndSeek(KafkaConsumer<Bytes, Bytes> consumer) {
    var seekOperations = SeekOperations.create(consumer, consumerPosition);
    var seekOffsets = new HashMap<>(seekOperations.getEndOffsets()); // defaulting offsets to topic end
    seekOffsets.putAll(seekOperations.getOffsetsForSeek()); // this will only set non-empty partitions
    consumer.assign(seekOffsets.keySet());
    seekOffsets.forEach(consumer::seek);
  }

}
