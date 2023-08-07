package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeMap;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public abstract class PerPartitionEmitter extends AbstractEmitter {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  protected final ConsumerPosition consumerPosition;
  protected final int messagesPerPage;

  protected PerPartitionEmitter(Supplier<EnhancedConsumer> consumerSupplier,
                                ConsumerPosition consumerPosition,
                                int messagesPerPage,
                                MessagesProcessing messagesProcessing,
                                PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.consumerPosition = consumerPosition;
    this.messagesPerPage = messagesPerPage;
    this.consumerSupplier = consumerSupplier;
  }

  // from inclusive, to exclusive
  protected record FromToOffset(/*inclusive*/ long from, /*exclusive*/ long to) {
  }

  //should return empty map if polling should be stopped
  protected abstract TreeMap<TopicPartition, FromToOffset> nextPollingRange(
      TreeMap<TopicPartition, FromToOffset> prevRange, //empty on start
      SeekOperations seekOperations
  );

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting polling for {}", consumerPosition);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      sendPhase(sink, "Consumer created");
      var seekOperations = SeekOperations.create(consumer, consumerPosition);
      TreeMap<TopicPartition, FromToOffset> readRange = nextPollingRange(new TreeMap<>(), seekOperations);
      log.debug("Starting from offsets {}", readRange);

      while (!sink.isCancelled() && !readRange.isEmpty() && !sendLimitReached()) {
        readRange.forEach((tp, fromTo) -> {
          if (sink.isCancelled()) {
            return; //fast return in case of sink cancellation
          }
          var polled = partitionPollIteration(tp, fromTo.from, fromTo.to, consumer, sink);
          buffer(polled);
        });
        flushBuffer(sink);
        readRange = nextPollingRange(readRange, seekOperations);
      }
      if (sink.isCancelled()) {
        log.debug("Polling finished due to sink cancellation");
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

  private List<ConsumerRecord<Bytes, Bytes>> partitionPollIteration(TopicPartition tp,
                                                                    long fromOffset, //inclusive
                                                                    long toOffset, //exclusive
                                                                    EnhancedConsumer consumer,
                                                                    FluxSink<TopicMessageEventDTO> sink) {
    consumer.assign(List.of(tp));
    consumer.seek(tp, fromOffset);
    sendPhase(sink, String.format("Polling partition: %s from offset %s", tp, fromOffset));

    var recordsToSend = new ArrayList<ConsumerRecord<Bytes, Bytes>>();
    while (!sink.isCancelled()
        && !sendLimitReached()
        && consumer.position(tp) < toOffset) {

      var polledRecords = pollSinglePartition(sink, consumer);
      log.debug("{} records polled from {}", polledRecords.count(), tp);

      polledRecords.records(tp).stream()
          .filter(r -> r.offset() < toOffset)
          .forEach(recordsToSend::add);
    }
    if (descendingSendSorting()) {
      Collections.reverse(recordsToSend);
    }
    return recordsToSend;
  }
}
