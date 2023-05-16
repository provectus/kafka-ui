package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.TreeMap;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class BackwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final ConsumerPosition consumerPosition;
  private final int messagesPerPage;

  public BackwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      ConsumerPosition consumerPosition,
      int messagesPerPage,
      MessagesProcessing messagesProcessing,
      PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.consumerPosition = consumerPosition;
    this.messagesPerPage = messagesPerPage;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting backward polling for {}", consumerPosition);
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Created consumer");

      var seekOperations = SeekOperations.create(consumer, consumerPosition);
      var readUntilOffsets = new TreeMap<TopicPartition, Long>(Comparator.comparingInt(TopicPartition::partition));
      readUntilOffsets.putAll(seekOperations.getOffsetsForSeek());

      int msgsToPollPerPartition = (int) Math.ceil((double) messagesPerPage / readUntilOffsets.size());
      log.debug("'Until' offsets for polling: {}", readUntilOffsets);

      while (!sink.isCancelled() && !readUntilOffsets.isEmpty() && !sendLimitReached()) {
        new TreeMap<>(readUntilOffsets).forEach((tp, readToOffset) -> {
          if (sink.isCancelled()) {
            return; //fast return in case of sink cancellation
          }
          long beginOffset = seekOperations.getBeginOffsets().get(tp);
          long readFromOffset = Math.max(beginOffset, readToOffset - msgsToPollPerPartition);

          partitionPollIteration(tp, readFromOffset, readToOffset, consumer, sink)
              .forEach(r -> sendMessage(sink, r));

          if (beginOffset == readFromOffset) {
            // we fully read this partition -> removing it from polling iterations
            readUntilOffsets.remove(tp);
          } else {
            // updating 'to' offset for next polling iteration
            readUntilOffsets.put(tp, readFromOffset);
          }
        });
        if (readUntilOffsets.isEmpty()) {
          log.debug("begin reached after partitions poll iteration");
        } else if (sink.isCancelled()) {
          log.debug("sink is cancelled after partitions poll iteration");
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

  private List<ConsumerRecord<Bytes, Bytes>> partitionPollIteration(
      TopicPartition tp,
      long fromOffset,
      long toOffset,
      Consumer<Bytes, Bytes> consumer,
      FluxSink<TopicMessageEventDTO> sink
  ) {
    consumer.assign(Collections.singleton(tp));
    consumer.seek(tp, fromOffset);
    sendPhase(sink, String.format("Polling partition: %s from offset %s", tp, fromOffset));
    int desiredMsgsToPoll = (int) (toOffset - fromOffset);

    var recordsToSend = new ArrayList<ConsumerRecord<Bytes, Bytes>>();

    EmptyPollsCounter emptyPolls  = pollingSettings.createEmptyPollsCounter();
    while (!sink.isCancelled()
        && !sendLimitReached()
        && recordsToSend.size() < desiredMsgsToPoll
        && !emptyPolls.noDataEmptyPollsReached()) {
      var polledRecords = poll(sink, consumer, pollingSettings.getPartitionPollTimeout());
      emptyPolls.count(polledRecords);

      log.debug("{} records polled from {}", polledRecords.count(), tp);

      var filteredRecords = polledRecords.records(tp).stream()
          .filter(r -> r.offset() < toOffset)
          .toList();

      if (!polledRecords.isEmpty() && filteredRecords.isEmpty()) {
        // we already read all messages in target offsets interval
        break;
      }
      recordsToSend.addAll(filteredRecords);
    }
    log.debug("{} records to send", recordsToSend.size());
    Collections.reverse(recordsToSend);
    return recordsToSend;
  }
}
