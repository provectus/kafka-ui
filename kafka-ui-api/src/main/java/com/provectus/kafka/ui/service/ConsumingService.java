package com.provectus.kafka.ui.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.FilterTopicMessageEvents;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import com.provectus.kafka.ui.util.OffsetsSeekForward;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
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

  public Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster, String topic,
                                              ConsumerPosition consumerPosition, String query,
                                              Integer limit) {
    int recordsLimit = Optional.ofNullable(limit)
        .map(s -> Math.min(s, MAX_RECORD_LIMIT))
        .orElse(DEFAULT_RECORD_LIMIT);

    java.util.function.Consumer<? super FluxSink<TopicMessageEventDTO>> emitter;
    RecordSerDe recordDeserializer =
        deserializationService.getRecordDeserializerForCluster(cluster);
    if (consumerPosition.getSeekDirection().equals(SeekDirectionDTO.FORWARD)) {
      emitter = new ForwardRecordEmitter(
          () -> kafkaService.createConsumer(cluster),
          new OffsetsSeekForward(topic, consumerPosition),
          recordDeserializer
      );
    } else {
      emitter = new BackwardRecordEmitter(
          (Map<String, Object> props) -> kafkaService.createConsumer(cluster, props),
          new OffsetsSeekBackward(topic, consumerPosition, recordsLimit),
          recordDeserializer
      );
    }
    return Flux.create(emitter)
        .filter(m -> filterTopicMessage(m, query))
        .takeWhile(new FilterTopicMessageEvents(recordsLimit))
        .subscribeOn(Schedulers.elastic())
        .share();
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
  public static Map<TopicPartition, Long> significantOffsets(Consumer<?, ?> consumer,
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

  private boolean filterTopicMessage(TopicMessageEventDTO message, String query) {
    log.info("filter");
    if (StringUtils.isEmpty(query)
        || !message.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE)) {
      return true;
    }

    final TopicMessageDTO msg = message.getMessage();
    return (!StringUtils.isEmpty(msg.getKey()) && msg.getKey().contains(query))
        || (!StringUtils.isEmpty(msg.getContent()) && msg.getContent().contains(query));
  }

}
