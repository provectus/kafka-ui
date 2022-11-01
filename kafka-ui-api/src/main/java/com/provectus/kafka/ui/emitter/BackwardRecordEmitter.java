package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.TreeMap;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class BackwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private static final Duration POLL_TIMEOUT = Duration.ofMillis(200);

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final ConsumerPosition consumerPosition;
  private final int messagesPerPage;

  public BackwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      ConsumerPosition consumerPosition,
      int messagesPerPage,
      ConsumerRecordDeserializer recordDeserializer) {
    super(recordDeserializer);
    this.consumerPosition = consumerPosition;
    this.messagesPerPage = messagesPerPage;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Created consumer");

      var seekOperations = SeekOperations.create(consumer, consumerPosition);
      var readUntilOffsets = new TreeMap<TopicPartition, Long>(Comparator.comparingInt(TopicPartition::partition));
      readUntilOffsets.putAll(seekOperations.getOffsetsForSeek());

      int msgsToPollPerPartition = (int) Math.ceil((double) messagesPerPage / readUntilOffsets.size());
      log.debug("'Until' offsets for polling: {}", readUntilOffsets);

      while (!sink.isCancelled() && !readUntilOffsets.isEmpty()) {
        new TreeMap<>(readUntilOffsets).forEach((tp, readToOffset) -> {
          if (sink.isCancelled()) {
            return; //fast return in case of sink cancellation
          }
          long beginOffset = seekOperations.getBeginOffsets().get(tp);
          long readFromOffset = Math.max(beginOffset, readToOffset - msgsToPollPerPartition);

          partitionPollIteration(tp, readFromOffset, readToOffset, consumer, sink)
              .stream()
              .filter(r -> !sink.isCancelled())
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

    // we use empty polls counting to verify that partition was fully read
    for (int emptyPolls = 0; recordsToSend.size() < desiredMsgsToPoll && emptyPolls < NO_MORE_DATA_EMPTY_POLLS_COUNT;) {
      var polledRecords = poll(sink, consumer, POLL_TIMEOUT);
      log.debug("{} records polled from {}", polledRecords.count(), tp);

      // counting sequential empty polls
      emptyPolls = polledRecords.isEmpty() ? emptyPolls + 1 : 0;

      var filteredRecords = polledRecords.records(tp).stream()
          .filter(r -> r.offset() < toOffset)
          .collect(Collectors.toList());

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
