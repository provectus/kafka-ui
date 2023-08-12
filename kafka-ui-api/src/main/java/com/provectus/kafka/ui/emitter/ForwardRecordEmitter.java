package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  private final ConsumerPosition position;

  public ForwardRecordEmitter(
      Supplier<EnhancedConsumer> consumerSupplier,
      ConsumerPosition position,
      MessagesProcessing messagesProcessing,
      PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.position = position;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting forward polling for {}", position);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var seekOperations = SeekOperations.create(consumer, position);
      seekOperations.assignAndSeekNonEmptyPartitions();

      EmptyPollsCounter emptyPolls = pollingSettings.createEmptyPollsCounter();
      while (!sink.isCancelled()
          && !sendLimitReached()
          && !seekOperations.assignedPartitionsFullyPolled()
          && !emptyPolls.noDataEmptyPollsReached()) {

        sendPhase(sink, "Polling");
        var records = poll(sink, consumer);
        emptyPolls.count(records.count());

        log.debug("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          sendMessage(sink, msg);
        }
      }
      sendFinishStatsAndCompleteSink(sink);
      log.debug("Polling finished");
    } catch (InterruptException kafkaInterruptException) {
      log.debug("Polling finished due to thread interruption");
      sink.complete();
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }
}
