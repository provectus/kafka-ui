package com.provectus.kafka.ui.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.deserialization.DeserializationService;
import com.provectus.kafka.ui.deserialization.RecordDeserializer;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.time.Duration;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Log4j2
@RequiredArgsConstructor
public class ConsumingService {

  private static final int MAX_RECORD_LIMIT = 100;
  private static final int DEFAULT_RECORD_LIMIT = 20;

  private final KafkaService kafkaService;
  private final DeserializationService deserializationService;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public Flux<TopicMessage> loadMessages(KafkaCluster cluster, String topic,
                                         ConsumerPosition consumerPosition, String query,
                                         Integer limit) {
    int recordsLimit = Optional.ofNullable(limit)
        .map(s -> Math.min(s, MAX_RECORD_LIMIT))
        .orElse(DEFAULT_RECORD_LIMIT);
    RecordEmitter emitter = new RecordEmitter(
        () -> kafkaService.createConsumer(cluster),
        new OffsetsSeek(topic, consumerPosition));
    RecordDeserializer recordDeserializer =
        deserializationService.getRecordDeserializerForCluster(cluster);
    return Flux.create(emitter)
        .subscribeOn(Schedulers.boundedElastic())
        .map(r -> ClusterUtil.mapToTopicMessage(r, recordDeserializer))
        .filter(m -> filterTopicMessage(m, query))
        .limitRequest(recordsLimit);
  }

  public Mono<Map<TopicPartition, Long>> offsetsForDeletion(KafkaCluster cluster, String topicName,
                                                            List<Integer> partitionsToInclude) {
    return Mono.fromSupplier(() -> {
      try (KafkaConsumer<Bytes, Bytes> consumer = kafkaService.createConsumer(cluster)) {
        return significantOffsets(consumer, topicName, partitionsToInclude);
      } catch (Exception e) {
        log.error("Error occurred while consuming records", e);
        throw new RuntimeException(e);
      }
    });
  }

  /**
   * returns end offsets for partitions where start offset != end offsets.
   * This is useful when we need to verify that partition is not empty.
   */
  private static Map<TopicPartition, Long> significantOffsets(Consumer<?, ?> consumer,
                                                              String topicName,
                                                              Collection<Integer>
                                                                  partitionsToInclude) {
    var partitions = consumer.partitionsFor(topicName).stream()
        .filter(p -> partitionsToInclude.isEmpty() || partitionsToInclude.contains(p.partition()))
        .map(p -> new TopicPartition(topicName, p.partition()))
        .collect(Collectors.toList());
    var beginningOffsets = consumer.beginningOffsets(partitions);
    var endOffsets = consumer.endOffsets(partitions);
    return endOffsets.entrySet().stream()
        .filter(entry -> !beginningOffsets.get(entry.getKey()).equals(entry.getValue()))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  private boolean filterTopicMessage(TopicMessage message, String query) {
    if (StringUtils.isEmpty(query)) {
      return true;
    }

    Object content = message.getContent();
    JsonNode tree = objectMapper.valueToTree(content);
    return treeContainsValue(tree, query);
  }

  private boolean treeContainsValue(JsonNode tree, String query) {
    LinkedList<JsonNode> nodesForSearch = new LinkedList<>();
    nodesForSearch.add(tree);

    while (!nodesForSearch.isEmpty()) {
      JsonNode node = nodesForSearch.removeFirst();

      if (node.isContainerNode()) {
        node.elements().forEachRemaining(nodesForSearch::add);
        continue;
      }

      String nodeValue = node.asText();
      if (nodeValue.contains(query)) {
        return true;
      }
    }

    return false;
  }

  @RequiredArgsConstructor
  static class RecordEmitter
      implements java.util.function.Consumer<FluxSink<ConsumerRecord<Bytes, Bytes>>> {

    private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

    private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
    private final OffsetsSeek offsetsSeek;

    @Override
    public void accept(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
      try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
        var waitingOffsets = offsetsSeek.assignAndSeek(consumer);
        while (!sink.isCancelled() && !waitingOffsets.endReached()) {
          ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
          log.info("{} records polled", records.count());
          for (ConsumerRecord<Bytes, Bytes> record : records) {
            if (!sink.isCancelled() && !waitingOffsets.endReached()) {
              sink.next(record);
              waitingOffsets.markPolled(record);
            } else {
              break;
            }
          }
        }
        sink.complete();
        log.info("Polling finished");
      } catch (Exception e) {
        log.error("Error occurred while consuming records", e);
        throw new RuntimeException(e);
      }
    }
  }

  @RequiredArgsConstructor
  static class OffsetsSeek {

    private final String topic;
    private final ConsumerPosition consumerPosition;

    public WaitingOffsets assignAndSeek(Consumer<Bytes, Bytes> consumer) {
      SeekType seekType = consumerPosition.getSeekType();
      log.info("Positioning consumer for topic {} with {}", topic, consumerPosition);
      switch (seekType) {
        case OFFSET:
          assignAndSeekForOffset(consumer);
          break;
        case TIMESTAMP:
          assignAndSeekForTimestamp(consumer);
          break;
        case BEGINNING:
          assignAndSeekFromBeginning(consumer);
          break;
        default:
          throw new IllegalArgumentException("Unknown seekType: " + seekType);
      }
      log.info("Assignment: {}", consumer.assignment());
      return new WaitingOffsets(topic, consumer);
    }

    private List<TopicPartition> getRequestedPartitions(Consumer<Bytes, Bytes> consumer) {
      Map<Integer, Long> partitionPositions = consumerPosition.getSeekTo();
      return consumer.partitionsFor(topic).stream()
          .filter(
              p -> partitionPositions.isEmpty() || partitionPositions.containsKey(p.partition()))
          .map(p -> new TopicPartition(p.topic(), p.partition()))
          .collect(Collectors.toList());
    }

    private void assignAndSeekForOffset(Consumer<Bytes, Bytes> consumer) {
      List<TopicPartition> partitions = getRequestedPartitions(consumer);
      consumer.assign(partitions);
      consumerPosition.getSeekTo().forEach((partition, offset) -> {
        TopicPartition topicPartition = new TopicPartition(topic, partition);
        consumer.seek(topicPartition, offset);
      });
    }

    private void assignAndSeekForTimestamp(Consumer<Bytes, Bytes> consumer) {
      Map<TopicPartition, Long> timestampsToSearch =
          consumerPosition.getSeekTo().entrySet().stream()
              .collect(Collectors.toMap(
                  partitionPosition -> new TopicPartition(topic, partitionPosition.getKey()),
                  Map.Entry::getValue
              ));
      Map<TopicPartition, Long> offsetsForTimestamps = consumer.offsetsForTimes(timestampsToSearch)
          .entrySet().stream()
          .filter(e -> e.getValue() != null)
          .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().offset()));

      if (offsetsForTimestamps.isEmpty()) {
        throw new IllegalArgumentException("No offsets were found for requested timestamps");
      }

      consumer.assign(offsetsForTimestamps.keySet());
      offsetsForTimestamps.forEach(consumer::seek);
    }

    private void assignAndSeekFromBeginning(Consumer<Bytes, Bytes> consumer) {
      List<TopicPartition> partitions = getRequestedPartitions(consumer);
      consumer.assign(partitions);
      consumer.seekToBeginning(partitions);
    }

    static class WaitingOffsets {
      final Map<Integer, Long> offsets = new HashMap<>(); // partition number -> offset

      WaitingOffsets(String topic, Consumer<?, ?> consumer) {
        var partitions = consumer.assignment().stream()
            .map(TopicPartition::partition)
            .collect(Collectors.toList());
        significantOffsets(consumer, topic, partitions)
            .forEach((tp, offset) -> offsets.put(tp.partition(), offset - 1));
      }

      void markPolled(ConsumerRecord<?, ?> rec) {
        Long waiting = offsets.get(rec.partition());
        if (waiting != null && waiting <= rec.offset()) {
          offsets.remove(rec.partition());
        }
      }

      boolean endReached() {
        return offsets.isEmpty();
      }
    }

  }
}
