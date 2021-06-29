package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@RequiredArgsConstructor
@Log4j2
public class BackwardRecordEmitter
    implements java.util.function.Consumer<FluxSink<ConsumerRecord<Bytes, Bytes>>> {

  private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

  private final Function<Map<String, Object>, KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeekBackward offsetsSeek;

  @Override
  public void accept(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
    try (KafkaConsumer<Bytes, Bytes> configConsumer = consumerSupplier.apply(Map.of())) {
      final List<TopicPartition> requestedPartitions =
          offsetsSeek.getRequestedPartitions(configConsumer);
      final int msgsPerPartition = offsetsSeek.msgsPerPartition(requestedPartitions.size());
      try (KafkaConsumer<Bytes, Bytes> consumer =
               consumerSupplier.apply(
                   Map.of(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, msgsPerPartition)
               )
      ) {
        final Map<TopicPartition, Long> partitionsOffsets =
            offsetsSeek.getPartitionsOffsets(consumer);
        log.info("partition offsets: {}", partitionsOffsets);
        var waitingOffsets =
            offsetsSeek.waitingOffsets(consumer, partitionsOffsets.keySet());
        log.info("waittin offsets {} {}",
            waitingOffsets.getBeginOffsets(),
            waitingOffsets.getEndOffsets()
        );
        while (!sink.isCancelled() && !waitingOffsets.beginReached()) {
          for (Map.Entry<TopicPartition, Long> entry : partitionsOffsets.entrySet()) {
            final Long lowest = waitingOffsets.getBeginOffsets().get(entry.getKey().partition());
            consumer.assign(Collections.singleton(entry.getKey()));
            final long offset = Math.max(lowest, entry.getValue() - msgsPerPartition);
            log.info("Polling {} from {}", entry.getKey(), offset);
            consumer.seek(entry.getKey(), offset);
            ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
            final List<ConsumerRecord<Bytes, Bytes>> partitionRecords =
                records.records(entry.getKey()).stream()
                  .filter(r -> r.offset() < partitionsOffsets.get(entry.getKey()))
                  .collect(Collectors.toList());
            Collections.reverse(partitionRecords);

            log.info("{} records polled", records.count());
            log.info("{} records sent", partitionRecords.size());
            for (ConsumerRecord<Bytes, Bytes> msg : partitionRecords) {
              if (!sink.isCancelled() && !waitingOffsets.beginReached()) {
                sink.next(msg);
                waitingOffsets.markPolled(msg);
              } else {
                log.info("Begin reached");
                break;
              }
            }
            partitionsOffsets.put(
                entry.getKey(),
                Math.max(offset, entry.getValue() - msgsPerPartition)
            );
          }
          if (waitingOffsets.beginReached()) {
            log.info("begin reached after partitions");
          } else if (sink.isCancelled()) {
            log.info("sink is cancelled after partitions");
          }
        }
        sink.complete();
        log.info("Polling finished");
      }
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }
}
