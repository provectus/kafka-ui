package com.provectus.kafka.ui.emitter;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Iterables;
import com.google.common.collect.Streams;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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
  private final List<TopicMessageDTO> buffer = new ArrayList<>();
  private long sentMessages = 0;
  private int filterApplyErrors = 0;

  private final ConsumerRecordDeserializer deserializer;
  private final Predicate<TopicMessageDTO> filter;
  private final boolean ascendingSortBeforeSend;
  private final @Nullable Integer limit;

  boolean limitReached() {
    return limit != null && sentMessages >= limit;
  }

  void buffer(ConsumerRecord<Bytes, Bytes> rec) {
    if (!limitReached()) {
      TopicMessageDTO topicMessage = deserializer.deserialize(rec);
      try {
        if (filter.test(topicMessage)) {
          buffer.add(topicMessage);
          sentMessages++;
        }
      } catch (Exception e) {
        filterApplyErrors++;
        log.trace("Error applying filter for message {}", topicMessage);
      }
    }
  }

  @VisibleForTesting
  static Stream<TopicMessageDTO> sorted(List<TopicMessageDTO> buffer, boolean asc) {
    Comparator<TopicMessageDTO> offsetComparator = asc
        ? Comparator.comparingLong(TopicMessageDTO::getOffset)
        : Comparator.comparingLong(TopicMessageDTO::getOffset).reversed();

    Comparator<TopicMessageDTO> tsComparator = asc
        ? Comparator.comparing(TopicMessageDTO::getTimestamp)
        : Comparator.comparing(TopicMessageDTO::getTimestamp).reversed();

    TreeMap<Integer, List<TopicMessageDTO>> perPartition = buffer.stream()
        .collect(
            Collectors.groupingBy(
                TopicMessageDTO::getPartition,
                TreeMap::new,
                Collectors.collectingAndThen(
                    Collectors.toList(),
                    lst -> lst.stream().sorted(offsetComparator).toList())));

    return Streams.stream(
        Iterables.mergeSorted(
            perPartition.values(),
            tsComparator
        )
    );
  }

  void flush(FluxSink<TopicMessageEventDTO> sink) {
    sorted(buffer, ascendingSortBeforeSend)
        .forEach(topicMessage -> {
          if (!sink.isCancelled()) {
            sink.next(
                new TopicMessageEventDTO()
                    .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
                    .message(topicMessage)
            );
          }
        });
    buffer.clear();
  }

  void sendWithoutBuffer(FluxSink<TopicMessageEventDTO> sink, ConsumerRecord<Bytes, Bytes> rec) {
    buffer(rec);
    flush(sink);
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
