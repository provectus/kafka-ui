package com.provectus.kafka.ui.service;

import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.emitter.MessageFilterStats;
import com.provectus.kafka.ui.emitter.MessageFilters;
import com.provectus.kafka.ui.emitter.ResultSizeLimiter;
import com.provectus.kafka.ui.emitter.TailingEmitter;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.serdes.ProducerRecordCreator;
import com.provectus.kafka.ui.util.SslPropertiesUtil;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
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

  // limiting UI messages rate to 20/sec in tailing mode
  public static final int TAILING_UI_MESSAGE_THROTTLE_RATE = 20;

  private final AdminClientService adminClientService;
  private final DeserializationService deserializationService;
  private final ConsumerGroupService consumerGroupService;

  private Mono<TopicDescription> withExistingTopic(KafkaCluster cluster, String topicName) {
    return adminClientService.get(cluster)
        .flatMap(client -> client.describeTopic(topicName))
        .switchIfEmpty(Mono.error(new TopicNotFoundException()));
  }

  public Mono<Void> deleteTopicMessages(KafkaCluster cluster, String topicName,
                                        List<Integer> partitionsToInclude) {
    return withExistingTopic(cluster, topicName)
        .flatMap(td ->
            offsetsForDeletion(cluster, topicName, partitionsToInclude)
                .flatMap(offsets ->
                    adminClientService.get(cluster).flatMap(ac -> ac.deleteRecords(offsets))));
  }

  private Mono<Map<TopicPartition, Long>> offsetsForDeletion(KafkaCluster cluster, String topicName,
                                                             List<Integer> partitionsToInclude) {
    return adminClientService.get(cluster).flatMap(ac ->
        ac.listTopicOffsets(topicName, OffsetSpec.earliest(), true)
            .zipWith(ac.listTopicOffsets(topicName, OffsetSpec.latest(), true),
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
    return withExistingTopic(cluster, topic)
        .publishOn(Schedulers.boundedElastic())
        .flatMap(desc -> sendMessageImpl(cluster, desc, msg));
  }

  private Mono<RecordMetadata> sendMessageImpl(KafkaCluster cluster,
                                               TopicDescription topicDescription,
                                               CreateTopicMessageDTO msg) {
    if (msg.getPartition() != null
        && msg.getPartition() > topicDescription.partitions().size() - 1) {
      return Mono.error(new ValidationException("Invalid partition"));
    }
    ProducerRecordCreator producerRecordCreator =
        deserializationService.producerRecordCreator(
            cluster,
            topicDescription.name(),
            msg.getKeySerde().get(),
            msg.getValueSerde().get()
        );

    Properties properties = new Properties();
    SslPropertiesUtil.addKafkaSslProperties(cluster.getOriginalProperties().getSsl(), properties);
    properties.putAll(cluster.getProperties());
    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    try (KafkaProducer<byte[], byte[]> producer = new KafkaProducer<>(properties)) {
      ProducerRecord<byte[], byte[]> producerRecord = producerRecordCreator.create(
          topicDescription.name(),
          msg.getPartition(),
          msg.getKey().orElse(null),
          msg.getContent().orElse(null),
          msg.getHeaders()
      );
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

  public Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster, String topic,
                                                 ConsumerPosition consumerPosition,
                                                 @Nullable String query,
                                                 MessageFilterTypeDTO filterQueryType,
                                                 int limit,
                                                 SeekDirectionDTO seekDirection,
                                                 @Nullable String keySerde,
                                                 @Nullable String valueSerde) {
    return withExistingTopic(cluster, topic)
        .flux()
        .publishOn(Schedulers.boundedElastic())
        .flatMap(td -> loadMessagesImpl(cluster, topic, consumerPosition, query,
            filterQueryType, limit, seekDirection, keySerde, valueSerde));
  }

  private Flux<TopicMessageEventDTO> loadMessagesImpl(KafkaCluster cluster,
                                                      String topic,
                                                      ConsumerPosition consumerPosition,
                                                      @Nullable String query,
                                                      MessageFilterTypeDTO filterQueryType,
                                                      int limit,
                                                      SeekDirectionDTO seekDirection,
                                                      @Nullable String keySerde,
                                                      @Nullable String valueSerde) {

    java.util.function.Consumer<? super FluxSink<TopicMessageEventDTO>> emitter;
    ConsumerRecordDeserializer recordDeserializer =
        deserializationService.deserializerFor(cluster, topic, keySerde, valueSerde);
    if (seekDirection.equals(SeekDirectionDTO.FORWARD)) {
      emitter = new ForwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          recordDeserializer,
          cluster.getPollingSettings()
      );
    } else if (seekDirection.equals(SeekDirectionDTO.BACKWARD)) {
      emitter = new BackwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          limit,
          recordDeserializer,
          cluster.getPollingSettings()
      );
    } else {
      emitter = new TailingEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          recordDeserializer,
          cluster.getPollingSettings()
      );
    }
    MessageFilterStats filterStats = new MessageFilterStats();
    return Flux.create(emitter)
        .contextWrite(ctx -> ctx.put(MessageFilterStats.class, filterStats))
        .filter(getMsgFilter(query, filterQueryType, filterStats))
        .map(getDataMasker(cluster, topic))
        .takeWhile(createTakeWhilePredicate(seekDirection, limit))
        .map(throttleUiPublish(seekDirection));
  }

  private Predicate<TopicMessageEventDTO> createTakeWhilePredicate(
      SeekDirectionDTO seekDirection, int limit) {
    return seekDirection == SeekDirectionDTO.TAILING
        ? evt -> true // no limit for tailing
        : new ResultSizeLimiter(limit);
  }

  private UnaryOperator<TopicMessageEventDTO> getDataMasker(KafkaCluster cluster, String topicName) {
    var keyMasker = cluster.getMasking().getMaskingFunction(topicName, Serde.Target.KEY);
    var valMasker = cluster.getMasking().getMaskingFunction(topicName, Serde.Target.VALUE);
    return evt -> {
      if (evt.getType() != TopicMessageEventDTO.TypeEnum.MESSAGE) {
        return evt;
      }
      return evt.message(
        evt.getMessage()
            .key(keyMasker.apply(evt.getMessage().getKey()))
            .content(valMasker.apply(evt.getMessage().getContent())));
    };
  }

  private Predicate<TopicMessageEventDTO> getMsgFilter(String query,
                                                       MessageFilterTypeDTO filterQueryType,
                                                       MessageFilterStats filterStats) {
    if (StringUtils.isEmpty(query)) {
      return evt -> true;
    }
    var messageFilter = MessageFilters.createMsgFilter(query, filterQueryType);
    return evt -> {
      // we only apply filter for message events
      if (evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE) {
        try {
          return messageFilter.test(evt.getMessage());
        } catch (Exception e) {
          filterStats.incrementApplyErrors();
          log.trace("Error applying filter '{}' for message {}", query, evt.getMessage());
          return false;
        }
      }
      return true;
    };
  }

  private <T> UnaryOperator<T> throttleUiPublish(SeekDirectionDTO seekDirection) {
    if (seekDirection == SeekDirectionDTO.TAILING) {
      RateLimiter rateLimiter = RateLimiter.create(TAILING_UI_MESSAGE_THROTTLE_RATE);
      return m -> {
        rateLimiter.acquire(1);
        return m;
      };
    }
    // there is no need to throttle UI production rate for non-tailing modes, since max number of produced
    // messages is limited for them (with page size)
    return UnaryOperator.identity();
  }

}
