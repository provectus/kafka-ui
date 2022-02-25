package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.emitter.MessageFilters;
import com.provectus.kafka.ui.emitter.TailingEmitter;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import com.provectus.kafka.ui.util.OffsetsSeekForward;
import com.provectus.kafka.ui.util.ResultSizeLimiter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagesService {
  private final AdminClientService adminClientService;
  private final DeserializationService deserializationService;
  private final ConsumerGroupService consumerGroupService;
  private final MetricsCache metricsCache;

  public Mono<Void> deleteTopicMessages(KafkaCluster cluster, String topicName,
                                        List<Integer> partitionsToInclude) {
    if (!metricsCache.get(cluster).getTopicDescriptions().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return offsetsForDeletion(cluster, topicName, partitionsToInclude)
        .flatMap(offsets ->
            adminClientService.get(cluster).flatMap(ac -> ac.deleteRecords(offsets)));
  }

  private Mono<Map<TopicPartition, Long>> offsetsForDeletion(KafkaCluster cluster, String topicName,
                                                             List<Integer> partitionsToInclude) {
    return adminClientService.get(cluster).flatMap(ac ->
        ac.listOffsets(topicName, OffsetSpec.earliest())
            .zipWith(ac.listOffsets(topicName, OffsetSpec.latest()),
                (start, end) ->
                    end.entrySet().stream()
                        .filter(e -> partitionsToInclude.isEmpty()
                            || partitionsToInclude.contains(e.getKey().partition()))
                        // we only need non-empty partitions (where start offset != end offset)
                        .filter(entry -> !entry.getValue().equals(start.get(entry.getKey())))
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
    );
  }

  public Mono<RecordMetadata> sendMessage(KafkaCluster cluster, String topic,
                                          CreateTopicMessageDTO msg) {
    if (msg.getPartition() != null
        && msg.getPartition() > metricsCache.get(cluster).getTopicDescriptions()
        .get(topic).partitions().size() - 1) {
      return Mono.error(new ValidationException("Invalid partition"));
    }
    RecordSerDe serde =
        deserializationService.getRecordDeserializerForCluster(cluster);

    Properties properties = new Properties();
    properties.putAll(cluster.getProperties());
    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    try (KafkaProducer<byte[], byte[]> producer = new KafkaProducer<>(properties)) {
      ProducerRecord<byte[], byte[]> producerRecord = serde.serialize(
          topic,
          msg.getKey().orElse(null),
          msg.getContent().orElse(null),
          msg.getPartition()
      );
      producerRecord = new ProducerRecord<>(
          producerRecord.topic(),
          producerRecord.partition(),
          producerRecord.key(),
          producerRecord.value(),
          createHeaders(msg.getHeaders()));

      CompletableFuture<RecordMetadata> cf = new CompletableFuture<>();
      producer.send(producerRecord, (metadata, exception) -> {
        if (exception != null) {
          cf.completeExceptionally(exception);
        } else {
          cf.complete(metadata);
        }
      });
      return Mono.fromFuture(cf);
    } catch (Throwable e) {
      return Mono.error(e);
    }
  }

  private Iterable<Header> createHeaders(@Nullable Map<String, String> clientHeaders) {
    if (clientHeaders == null) {
      return new RecordHeaders();
    }
    RecordHeaders headers = new RecordHeaders();
    clientHeaders.forEach((k, v) -> headers.add(new RecordHeader(k, v.getBytes())));
    return headers;
  }

  public Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster, String topic,
                                                 ConsumerPosition consumerPosition, String query,
                                                 MessageFilterTypeDTO filterQueryType,
                                                 int limit) {

    java.util.function.Consumer<? super FluxSink<TopicMessageEventDTO>> emitter;
    RecordSerDe recordDeserializer =
        deserializationService.getRecordDeserializerForCluster(cluster);
    if (consumerPosition.getSeekDirection().equals(SeekDirectionDTO.FORWARD)) {
      emitter = new ForwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          new OffsetsSeekForward(topic, consumerPosition),
          recordDeserializer
      );
    } else if (consumerPosition.getSeekDirection().equals(SeekDirectionDTO.BACKWARD)) {
      emitter = new BackwardRecordEmitter(
          (Map<String, Object> props) -> consumerGroupService.createConsumer(cluster, props),
          new OffsetsSeekBackward(topic, consumerPosition, limit),
          recordDeserializer
      );
    } else {
      emitter = new TailingEmitter(
          recordDeserializer,
          () -> consumerGroupService.createConsumer(cluster),
          new OffsetsSeekForward(topic, consumerPosition)
      );
    }
    return Flux.create(emitter)
        .filter(getMsgFilter(query, filterQueryType))
        .takeWhile(createTakeWhilePredicate(consumerPosition, limit))
        .subscribeOn(Schedulers.boundedElastic())
        .share();
  }

  private Predicate<TopicMessageEventDTO> createTakeWhilePredicate(
      ConsumerPosition consumerPosition, int limit) {
    return consumerPosition.getSeekDirection() == SeekDirectionDTO.TAILING
        ? evt -> true // no limit for tailing
        : new ResultSizeLimiter(limit);
  }

  private Predicate<TopicMessageEventDTO> getMsgFilter(String query, MessageFilterTypeDTO filterQueryType) {
    if (StringUtils.isEmpty(query)) {
      return evt -> true;
    }
    filterQueryType = Optional.ofNullable(filterQueryType)
        .orElse(MessageFilterTypeDTO.STRING_CONTAINS);
    var messageFilter = MessageFilters.createMsgFilter(query, filterQueryType);
    return evt -> {
      // we only apply filter for message events
      if (evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE) {
        return messageFilter.test(evt.getMessage());
      }
      return true;
    };
  }

}
