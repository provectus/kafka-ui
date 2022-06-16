package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
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

  private final Function<Map<String, Object>, KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeekBackward offsetsSeek;

  public BackwardRecordEmitter(
      Function<Map<String, Object>, KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      OffsetsSeekBackward offsetsSeek,
      RecordSerDe recordDeserializer) {
    super(recordDeserializer);
    this.offsetsSeek = offsetsSeek;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    try (KafkaConsumer<Bytes, Bytes> configConsumer = consumerSupplier.apply(Map.of())) {
      final List<TopicPartition> requestedPartitions =
          offsetsSeek.getRequestedPartitions(configConsumer);
      sendPhase(sink, "Request partitions");
      final int msgsPerPartition = offsetsSeek.msgsPerPartition(requestedPartitions.size());
      try (KafkaConsumer<Bytes, Bytes> consumer =
               consumerSupplier.apply(
                   Map.of(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, msgsPerPartition)
               )
      ) {
        sendPhase(sink, "Created consumer");

        SortedMap<TopicPartition, Long> readUntilOffsets =
            new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
        readUntilOffsets.putAll(offsetsSeek.getPartitionsOffsets(consumer));

        sendPhase(sink, "Requested partitions offsets");
        log.debug("partition offsets: {}", readUntilOffsets);
        var waitingOffsets =
            offsetsSeek.waitingOffsets(consumer, readUntilOffsets.keySet());
        log.debug("waiting offsets {} {}",
            waitingOffsets.getBeginOffsets(),
            waitingOffsets.getEndOffsets()
        );

        while (!sink.isCancelled() && !waitingOffsets.beginReached()) {
          new TreeMap<>(readUntilOffsets).forEach((tp, readToOffset) -> {
            long lowestOffset = waitingOffsets.getBeginOffsets().get(tp.partition());
            long readFromOffset = Math.max(lowestOffset, readToOffset - msgsPerPartition);

            partitionPollIteration(tp, readFromOffset, readToOffset, consumer, sink)
                .stream()
                .filter(r -> !sink.isCancelled())
                .forEach(r -> sendMessage(sink, r));

            waitingOffsets.markPolled(tp.partition(), readFromOffset);
            if (waitingOffsets.getBeginOffsets().get(tp.partition()) == null) {
              // we fully read this partition -> removing it from polling iterations
              readUntilOffsets.remove(tp);
            } else {
              readUntilOffsets.put(tp, readFromOffset);
            }
          });

          if (waitingOffsets.beginReached()) {
            log.debug("begin reached after partitions poll iteration");
          } else if (sink.isCancelled()) {
            log.debug("sink is cancelled after partitions poll iteration");
          }
        }
        sink.complete();
        log.debug("Polling finished");
      }
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
    for (int emptyPolls = 0; recordsToSend.size() < desiredMsgsToPoll && emptyPolls < 3; ) {
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
