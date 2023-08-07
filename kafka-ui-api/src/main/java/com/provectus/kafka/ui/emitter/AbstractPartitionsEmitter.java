package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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
public abstract class AbstractPartitionsEmitter extends AbstractEmitter {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  protected final ConsumerPosition consumerPosition;
  protected final int messagesPerPage;

  public AbstractPartitionsEmitter(Supplier<EnhancedConsumer> consumerSupplier,
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
  protected record FromToOffset(long from, long to) {
  }

  //should return empty map if polling should be stopped
  protected abstract TreeMap<TopicPartition, FromToOffset> nexPollingRange(
      EnhancedConsumer consumer,
      TreeMap<TopicPartition, FromToOffset> prevRange, //empty on start
      SeekOperations seekOperations
  );

  protected abstract Comparator<TopicMessageDTO> sortBeforeSend();

  private void logReadRange(TreeMap<TopicPartition, FromToOffset> range) {
    log.debug("Polling offsets range {}", range);
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting polling for {}", consumerPosition);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      sendPhase(sink, "Consumer created");

      var seekOperations = SeekOperations.create(consumer, consumerPosition);
      TreeMap<TopicPartition, FromToOffset> readRange = nexPollingRange(consumer, new TreeMap<>(), seekOperations);
      logReadRange(readRange);
      while (!sink.isCancelled() && !readRange.isEmpty() && !sendLimitReached()) {
        readRange.forEach((tp, fromTo) -> {
          if (sink.isCancelled()) {
            return; //fast return in case of sink cancellation
          }
          partitionPollIteration(tp, fromTo.from, fromTo.to, consumer, sink)
              .forEach(messagesProcessing::buffer);
        });
        messagesProcessing.flush(sink, sortBeforeSend());
        readRange = nexPollingRange(consumer, readRange, seekOperations);
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

      var polledRecords = poll(sink, consumer, pollingSettings.getPartitionPollTimeout());
      log.debug("{} records polled from {}", polledRecords.count(), tp);

      polledRecords.records(tp).stream()
          .filter(r -> r.offset() < toOffset)
          .forEach(recordsToSend::add);
    }
    return recordsToSend;
  }
}
