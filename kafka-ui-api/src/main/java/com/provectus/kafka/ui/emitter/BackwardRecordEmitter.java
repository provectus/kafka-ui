package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class BackwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

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

        SortedMap<TopicPartition, Long> partitionsOffsets =
            new TreeMap<>(Comparator.comparingInt(TopicPartition::partition));
        partitionsOffsets.putAll(offsetsSeek.getPartitionsOffsets(consumer));

        sendPhase(sink, "Requested partitions offsets");
        log.debug("partition offsets: {}", partitionsOffsets);
        var waitingOffsets =
            offsetsSeek.waitingOffsets(consumer, partitionsOffsets.keySet());
        log.debug("waiting offsets {} {}",
            waitingOffsets.getBeginOffsets(),
            waitingOffsets.getEndOffsets()
        );

        while (!sink.isCancelled() && !waitingOffsets.beginReached()) {
          for (Map.Entry<TopicPartition, Long> entry : partitionsOffsets.entrySet()) {
            final Long lowest = waitingOffsets.getBeginOffsets().get(entry.getKey().partition());
            if (lowest != null) {
              consumer.assign(Collections.singleton(entry.getKey()));
              final long offset = Math.max(lowest, entry.getValue() - msgsPerPartition);
              log.debug("Polling {} from {}", entry.getKey(), offset);
              consumer.seek(entry.getKey(), offset);
              sendPhase(sink,
                  String.format("Consuming partition: %s from %s", entry.getKey(), offset)
              );
              final ConsumerRecords<Bytes, Bytes> records = poll(sink, consumer);
              final List<ConsumerRecord<Bytes, Bytes>> partitionRecords =
                  records.records(entry.getKey()).stream()
                      .filter(r -> r.offset() < partitionsOffsets.get(entry.getKey()))
                      .collect(Collectors.toList());
              Collections.reverse(partitionRecords);

              log.debug("{} records polled", records.count());
              log.debug("{} records sent", partitionRecords.size());

              // This is workaround for case when partition begin offset is less than
              // real minimal offset, usually appear in compcated topics
              if (records.count() > 0 && partitionRecords.isEmpty()) {
                waitingOffsets.markPolled(entry.getKey().partition());
              }

              for (ConsumerRecord<Bytes, Bytes> msg : partitionRecords) {
                if (!sink.isCancelled() && !waitingOffsets.beginReached()) {
                  sendMessage(sink, msg);
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
