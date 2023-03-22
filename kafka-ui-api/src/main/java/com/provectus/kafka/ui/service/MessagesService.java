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
import com.provectus.kafka.ui.model.PollingModeDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.serdes.ProducerRecordCreator;
import com.provectus.kafka.ui.util.SslPropertiesUtil;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
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

  private final Map<String, Predicate<TopicMessageDTO>> registeredFilters = new ConcurrentHashMap<>();

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

  public Flux<TopicMessageEventDTO> loadMessagesV2(KafkaCluster cluster,
                                                   String topic,
                                                   ConsumerPosition position,
                                                   @Nullable String query,
                                                   @Nullable String filterId,
                                                   int limit,
                                                   @Nullable String keySerde,
                                                   @Nullable String valueSerde) {
    return withExistingTopic(cluster, topic)
        .flux()
        .publishOn(Schedulers.boundedElastic())
        .flatMap(td -> loadMessagesImplV2(cluster, topic, position, query, filterId, limit, keySerde, valueSerde));
  }

  private Flux<TopicMessageEventDTO> loadMessagesImplV2(KafkaCluster cluster,
                                                        String topic,
                                                        ConsumerPosition consumerPosition,
                                                        @Nullable String query,
                                                        @Nullable String filterId,
                                                        int limit,
                                                        @Nullable String keySerde,
                                                        @Nullable String valueSerde) {

    ConsumerRecordDeserializer recordDeserializer =
        deserializationService.deserializerFor(cluster, topic, keySerde, valueSerde);

    var emitter = switch (consumerPosition.pollingMode()) {
      case TO_OFFSET, TO_TIMESTAMP, LATEST -> new BackwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          limit,
          recordDeserializer,
          cluster.getPollingSettings()
      );
      case FROM_OFFSET, FROM_TIMESTAMP, EARLIEST -> new ForwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          recordDeserializer,
          cluster.getPollingSettings()
      );
      case TAILING -> new TailingEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          recordDeserializer,
          cluster.getPollingSettings()
      );
    };

    MessageFilterStats filterStats = new MessageFilterStats();
    return Flux.create(emitter)
        .contextWrite(ctx -> ctx.put(MessageFilterStats.class, filterStats))
        .filter(getMsgFilter(query, filterId, filterStats))
        .map(getDataMasker(cluster, topic))
        .takeWhile(createTakeWhilePredicate(consumerPosition.pollingMode(), limit))
        .map(throttleUiPublish(consumerPosition.pollingMode()));
  }

  private Predicate<TopicMessageEventDTO> createTakeWhilePredicate(
      PollingModeDTO pollingMode, int limit) {
    return pollingMode == PollingModeDTO.TAILING
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

  public String registerMessageFilter(String groovyCode) {
    var filter = MessageFilters.groovyScriptFilter(groovyCode);
    var id = RandomStringUtils.random(10, true, true);
    registeredFilters.put(id, filter);
    return id;
  }

  private Predicate<TopicMessageEventDTO> getMsgFilter(@Nullable String containsStrFilter,
                                                       @Nullable String filterId,
                                                       MessageFilterStats filterStats) {
    Predicate<TopicMessageDTO> messageFilter = e -> true;
    if (containsStrFilter != null) {
      messageFilter = MessageFilters.containsStringFilter(containsStrFilter);
    }
    if (filterId != null) {
      messageFilter = registeredFilters.get(filterId);
      if (messageFilter == null) {
        throw new ValidationException("No filter was registered with id " + filterId);
      }
    }
    Predicate<TopicMessageDTO> finalMessageFilter = messageFilter;
    return evt -> {
      // we only apply filter for message events
      if (evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE) {
        try {
          return finalMessageFilter.test(evt.getMessage());
        } catch (Exception e) {
          filterStats.incrementApplyErrors();
          log.trace("Error applying filter for message {}", evt.getMessage());
          return false;
        }
      }
      return true;
    };
  }

  private <T> UnaryOperator<T> throttleUiPublish(PollingModeDTO pollingMode) {
    if (pollingMode == PollingModeDTO.TAILING) {
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
