package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.errors.InterruptException;
import reactor.core.publisher.FluxSink;

@Slf4j
public class TailingEmitter extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  private final ConsumerPosition consumerPosition;

  public TailingEmitter(Supplier<EnhancedConsumer> consumerSupplier,
                        ConsumerPosition consumerPosition,
                        MessagesProcessing messagesProcessing,
                        PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.consumerSupplier = consumerSupplier;
    this.consumerPosition = consumerPosition;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting tailing polling for {}", consumerPosition);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      SeekOperations.create(consumer, consumerPosition)
          .assignAndSeek();
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

}
