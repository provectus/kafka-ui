package com.provectus.kafka.ui.emitter;

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Iterables;
import com.google.common.collect.Streams;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.Comparator;
import java.util.List;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
@RequiredArgsConstructor
class MessagesProcessing {

  private final ConsumingStats consumingStats = new ConsumingStats();
  private long sentMessages = 0;
  private int filterApplyErrors = 0;

  private final ConsumerRecordDeserializer deserializer;
  private final Predicate<TopicMessageDTO> filter;
  private final boolean ascendingSortBeforeSend;
  private final @Nullable Integer limit;

  boolean limitReached() {
    return limit != null && sentMessages >= limit;
  }

  @VisibleForTesting
  static Iterable<ConsumerRecord<Bytes, Bytes>> sorted(Iterable<ConsumerRecord<Bytes, Bytes>> records, boolean asc) {
    Comparator<ConsumerRecord> offsetComparator = asc
        ? Comparator.comparingLong(ConsumerRecord::offset)
        : Comparator.<ConsumerRecord>comparingLong(ConsumerRecord::offset).reversed();

    Comparator<ConsumerRecord> tsComparator = asc
        ? Comparator.comparing(ConsumerRecord::timestamp)
        : Comparator.<ConsumerRecord>comparingLong(ConsumerRecord::timestamp).reversed();

    TreeMap<Integer, List<ConsumerRecord<Bytes, Bytes>>> perPartition = Streams.stream(records)
        .collect(
            groupingBy(
                ConsumerRecord::partition,
                TreeMap::new,
                collectingAndThen(
                    toList(),
                    lst -> lst.stream().sorted(offsetComparator).toList())));

    return Iterables.mergeSorted(perPartition.values(), tsComparator);
  }

  void send(FluxSink<TopicMessageEventDTO> sink, Iterable<ConsumerRecord<Bytes, Bytes>> polled) {
    sorted(polled, ascendingSortBeforeSend)
        .forEach(rec -> {
          if (!limitReached() && !sink.isCancelled()) {
            TopicMessageDTO topicMessage = deserializer.deserialize(rec);
            try {
              if (filter.test(topicMessage)) {
                sink.next(
                    new TopicMessageEventDTO()
                        .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
                        .message(topicMessage)
                );
                sentMessages++;
              }
            } catch (Exception e) {
              filterApplyErrors++;
              log.trace("Error applying filter for message {}", topicMessage);
            }
          }
        });
  }

  void sentConsumingInfo(FluxSink<TopicMessageEventDTO> sink, PolledRecords polledRecords) {
    if (!sink.isCancelled()) {
      consumingStats.sendConsumingEvt(sink, polledRecords, filterApplyErrors);
    }
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    if (!sink.isCancelled()) {
      consumingStats.sendFinishEvent(sink, filterApplyErrors);
    }
  }

  void sendPhase(FluxSink<TopicMessageEventDTO> sink, String name) {
    if (!sink.isCancelled()) {
      sink.next(
          new TopicMessageEventDTO()
              .type(TopicMessageEventDTO.TypeEnum.PHASE)
              .phase(new TopicMessagePhaseDTO().name(name))
      );
    }
  }

}
