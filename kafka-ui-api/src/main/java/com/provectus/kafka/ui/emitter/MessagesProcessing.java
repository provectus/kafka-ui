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
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Predicate;
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

  private final ConsumerRecordDeserializer deserializer;
  private final Predicate<TopicMessageDTO> filter;
  private final boolean ascendingSortBeforeSend;
  private final @Nullable Integer limit;

  boolean limitReached() {
    return limit != null && sentMessages >= limit;
  }

  void send(FluxSink<TopicMessageEventDTO> sink, Iterable<ConsumerRecord<Bytes, Bytes>> polled) {
    sortForSending(polled, ascendingSortBeforeSend)
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
              consumingStats.incFilterApplyError();
              log.trace("Error applying filter for message {}", topicMessage);
            }
          }
        });
  }

  void sentConsumingInfo(FluxSink<TopicMessageEventDTO> sink, PolledRecords polledRecords) {
    if (!sink.isCancelled()) {
      consumingStats.sendConsumingEvt(sink, polledRecords);
    }
  }

  void sendFinishEvent(FluxSink<TopicMessageEventDTO> sink) {
    if (!sink.isCancelled()) {
      consumingStats.sendFinishEvent(sink);
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

  /*
   * Sorting by timestamps, BUT requesting that records within same partitions should be ordered by offsets.
   */
  @VisibleForTesting
  static Iterable<ConsumerRecord<Bytes, Bytes>> sortForSending(Iterable<ConsumerRecord<Bytes, Bytes>> records,
                                                               boolean asc) {
    Comparator<ConsumerRecord> offsetComparator = asc
        ? Comparator.comparingLong(ConsumerRecord::offset)
        : Comparator.<ConsumerRecord>comparingLong(ConsumerRecord::offset).reversed();

    // partition -> sorted by offsets records
    Map<Integer, List<ConsumerRecord<Bytes, Bytes>>> perPartition = Streams.stream(records)
        .collect(
            groupingBy(
                ConsumerRecord::partition,
                TreeMap::new,
                collectingAndThen(toList(), lst -> lst.stream().sorted(offsetComparator).toList())));

    Comparator<ConsumerRecord> tsComparator = asc
        ? Comparator.comparing(ConsumerRecord::timestamp)
        : Comparator.<ConsumerRecord>comparingLong(ConsumerRecord::timestamp).reversed();

    // merge-sorting records from partitions one by one using timestamp comparator
    return Iterables.mergeSorted(perPartition.values(), tsComparator);
  }

}
