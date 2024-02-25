package com.provectus.kafka.ui.service;

import com.google.common.base.Charsets;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.hash.Hashing;
import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.Cursor;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.emitter.MessageFilters;
import com.provectus.kafka.ui.emitter.MessagesProcessing;
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
import java.util.Optional;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class MessagesService {

  private static final long SALT_FOR_HASHING = ThreadLocalRandom.current().nextLong();

  private static final int DEFAULT_MAX_PAGE_SIZE = 500;
  private static final int DEFAULT_PAGE_SIZE = 100;
  // limiting UI messages rate to 20/sec in tailing mode
  private static final int TAILING_UI_MESSAGE_THROTTLE_RATE = 20;

  private final AdminClientService adminClientService;
  private final DeserializationService deserializationService;
  private final ConsumerGroupService consumerGroupService;
  private final int maxPageSize;
  private final int defaultPageSize;

  private final Cache<String, Predicate<TopicMessageDTO>> registeredFilters = CacheBuilder.newBuilder()
      .maximumSize(5_000)
      .build();

  private final PollingCursorsStorage cursorsStorage = new PollingCursorsStorage();

  public MessagesService(AdminClientService adminClientService,
                         DeserializationService deserializationService,
                         ConsumerGroupService consumerGroupService,
                         ClustersProperties properties) {
    this.adminClientService = adminClientService;
    this.deserializationService = deserializationService;
    this.consumerGroupService = consumerGroupService;

    var pollingProps = Optional.ofNullable(properties.getPolling())
        .orElseGet(ClustersProperties.PollingProperties::new);
    this.maxPageSize = Optional.ofNullable(pollingProps.getMaxPageSize())
        .orElse(DEFAULT_MAX_PAGE_SIZE);
    this.defaultPageSize = Optional.ofNullable(pollingProps.getDefaultPageSize())
        .orElse(DEFAULT_PAGE_SIZE);
  }

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

  private int fixPageSize(@Nullable Integer pageSize) {
    return Optional.ofNullable(pageSize)
        .filter(ps -> ps > 0 && ps <= maxPageSize)
        .orElse(defaultPageSize);
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

  public Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster,
                                                  String topic,
                                                  ConsumerPosition consumerPosition,
                                                  @Nullable String containsStringFilter,
                                                  @Nullable String filterId,
                                                  @Nullable Integer limit,
                                                  @Nullable String keySerde,
                                                  @Nullable String valueSerde) {
    return loadMessages(
        cluster,
        topic,
        deserializationService.deserializerFor(cluster, topic, keySerde, valueSerde),
        consumerPosition,
        getMsgFilter(containsStringFilter, filterId),
        fixPageSize(limit)
    );
  }

  public Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster, String topic, String cursorId) {
    Cursor cursor = cursorsStorage.getCursor(cursorId)
        .orElseThrow(() -> new ValidationException("Next page cursor not found. Maybe it was evicted from cache."));
    return loadMessages(
        cluster,
        topic,
        cursor.deserializer(),
        cursor.consumerPosition(),
        cursor.filter(),
        cursor.limit()
    );
  }

  private Flux<TopicMessageEventDTO> loadMessages(KafkaCluster cluster,
                                                  String topic,
                                                  ConsumerRecordDeserializer deserializer,
                                                  ConsumerPosition consumerPosition,
                                                  Predicate<TopicMessageDTO> filter,
                                                  int limit) {
    return withExistingTopic(cluster, topic)
        .flux()
        .publishOn(Schedulers.boundedElastic())
        .flatMap(td -> loadMessagesImpl(cluster, topic, deserializer, consumerPosition, filter, fixPageSize(limit)));
  }

  private Flux<TopicMessageEventDTO> loadMessagesImpl(KafkaCluster cluster,
                                                      String topic,
                                                      ConsumerRecordDeserializer deserializer,
                                                      ConsumerPosition consumerPosition,
                                                      Predicate<TopicMessageDTO> filter,
                                                      int limit) {
    var processing = new MessagesProcessing(
        deserializer,
        filter,
        consumerPosition.pollingMode() == PollingModeDTO.TAILING ? null : limit
    );

    var emitter = switch (consumerPosition.pollingMode()) {
      case TO_OFFSET, TO_TIMESTAMP, LATEST -> new BackwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          limit,
          processing,
          cluster.getPollingSettings(),
          new Cursor.Tracking(deserializer, consumerPosition, filter, limit, cursorsStorage::register)
      );
      case FROM_OFFSET, FROM_TIMESTAMP, EARLIEST -> new ForwardRecordEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          processing,
          cluster.getPollingSettings(),
          new Cursor.Tracking(deserializer, consumerPosition, filter, limit, cursorsStorage::register)
      );
      case TAILING -> new TailingEmitter(
          () -> consumerGroupService.createConsumer(cluster),
          consumerPosition,
          processing,
          cluster.getPollingSettings()
      );
    };
    return Flux.create(emitter)
        .map(getDataMasker(cluster, topic))
        .map(throttleUiPublish(consumerPosition.pollingMode()));
  }

  public String registerMessageFilter(String groovyCode) {
    String saltedCode = groovyCode + SALT_FOR_HASHING;
    String filterId = Hashing.sha256()
        .hashString(saltedCode, Charsets.UTF_8)
        .toString()
        .substring(0, 8);
    if (registeredFilters.getIfPresent(filterId) == null) {
      registeredFilters.put(filterId, MessageFilters.groovyScriptFilter(groovyCode));
    }
    return filterId;
  }

  private Predicate<TopicMessageDTO> getMsgFilter(@Nullable String containsStrFilter,
                                                  @Nullable String smartFilterId) {
    Predicate<TopicMessageDTO> messageFilter = MessageFilters.noop();
    if (containsStrFilter != null) {
      messageFilter = messageFilter.and(MessageFilters.containsStringFilter(containsStrFilter));
    }
    if (smartFilterId != null) {
      var registered = registeredFilters.getIfPresent(smartFilterId);
      if (registered == null) {
        throw new ValidationException("No filter was registered with id " + smartFilterId);
      }
      messageFilter = messageFilter.and(registered);
    }
    return messageFilter;
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
