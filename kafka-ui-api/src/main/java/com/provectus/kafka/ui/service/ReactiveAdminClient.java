package com.provectus.kafka.ui.service;

import static com.google.common.util.concurrent.Uninterruptibles.getUninterruptibly;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterators;
import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.util.MapUtil;
import com.provectus.kafka.ui.util.NumberUtil;
import java.io.Closeable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.DescribeConfigsOptions;
import org.apache.kafka.clients.admin.ListConsumerGroupOffsetsOptions;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.RecordsToDelete;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaException;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.TopicPartitionReplica;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclBindingFilter;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.errors.GroupIdNotFoundException;
import org.apache.kafka.common.errors.GroupNotEmptyException;
import org.apache.kafka.common.errors.InvalidRequestException;
import org.apache.kafka.common.errors.SecurityDisabledException;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;


@Slf4j
@RequiredArgsConstructor
public class ReactiveAdminClient implements Closeable {

  public enum SupportedFeature {
    INCREMENTAL_ALTER_CONFIGS(2.3f),
    CONFIG_DOCUMENTATION_RETRIEVAL(2.6f),
    AUTHORIZED_SECURITY_ENABLED(ReactiveAdminClient::isAuthorizedSecurityEnabled);

    private final BiFunction<AdminClient, Float, Mono<Boolean>> predicate;

    SupportedFeature(BiFunction<AdminClient, Float, Mono<Boolean>> predicate) {
      this.predicate = predicate;
    }

    SupportedFeature(float fromVersion) {
      this.predicate = (admin, ver) -> Mono.just(ver != null && ver >= fromVersion);
    }

    static Mono<Set<SupportedFeature>> forVersion(AdminClient ac, @Nullable Float kafkaVersion) {
      return Flux.fromArray(SupportedFeature.values())
          .flatMap(f -> f.predicate.apply(ac, kafkaVersion).map(enabled -> Tuples.of(f, enabled)))
          .filter(Tuple2::getT2)
          .map(Tuple2::getT1)
          .collect(Collectors.toSet());
    }
  }

  @Value
  public static class ClusterDescription {
    @Nullable
    Node controller;
    String clusterId;
    Collection<Node> nodes;
    Set<AclOperation> authorizedOperations;
  }

  public static Mono<ReactiveAdminClient> create(AdminClient adminClient) {
    return getClusterVersion(adminClient)
        .flatMap(ver ->
            getSupportedUpdateFeaturesForVersion(adminClient, ver)
                .map(features ->
                    new ReactiveAdminClient(adminClient, ver, features)));
  }

  private static Mono<Set<SupportedFeature>> getSupportedUpdateFeaturesForVersion(AdminClient ac, String versionStr) {
    Float kafkaVersion = null;
    try {
      kafkaVersion = NumberUtil.parserClusterVersion(versionStr);
    } catch (NumberFormatException e) {
      //Nothing to do here
    }
    return SupportedFeature.forVersion(ac, kafkaVersion);
  }

  private static Mono<Boolean> isAuthorizedSecurityEnabled(AdminClient ac, @Nullable Float kafkaVersion) {
    return toMono(ac.describeAcls(AclBindingFilter.ANY).values())
        .thenReturn(true)
        .doOnError(th -> !(th instanceof SecurityDisabledException) && !(th instanceof InvalidRequestException),
            th -> log.warn("Error checking if security enabled", th))
        .onErrorReturn(false);
  }

  //TODO: discuss - maybe we should map kafka-library's exceptions to our exceptions here
  private static <T> Mono<T> toMono(KafkaFuture<T> future) {
    return Mono.<T>create(sink -> future.whenComplete((res, ex) -> {
      if (ex != null) {
        // KafkaFuture doc is unclear about what exception wrapper will be used
        // (from docs it should be ExecutionException, be we actually see CompletionException, so checking both
        if (ex instanceof CompletionException || ex instanceof ExecutionException) {
          sink.error(ex.getCause()); //unwrapping exception
        } else {
          sink.error(ex);
        }
      } else {
        sink.success(res);
      }
    })).doOnCancel(() -> future.cancel(true))
        // AdminClient is using single thread for kafka communication
        // and by default all downstream operations (like map(..)) on created Mono will be executed on this thread.
        // If some of downstream operation are blocking (by mistake) this can lead to
        // other AdminClient's requests stucking, which can cause timeout exceptions.
        // So, we explicitly setting Scheduler for downstream processing.
        .publishOn(Schedulers.parallel());
  }

  //---------------------------------------------------------------------------------

  private final AdminClient client;
  private final String version;
  private final Set<SupportedFeature> features;

  public Set<SupportedFeature> getClusterFeatures() {
    return features;
  }

  public Mono<Set<String>> listTopics(boolean listInternal) {
    return toMono(client.listTopics(new ListTopicsOptions().listInternal(listInternal)).names());
  }

  public Mono<Void> deleteTopic(String topicName) {
    return toMono(client.deleteTopics(List.of(topicName)).all());
  }

  public String getVersion() {
    return version;
  }

  public Mono<Map<String, List<ConfigEntry>>> getTopicsConfig() {
    return listTopics(true).flatMap(topics -> getTopicsConfig(topics, false));
  }

  public Mono<Map<String, List<ConfigEntry>>> getTopicsConfig(Collection<String> topicNames, boolean includeDoc) {
    var includeDocFixed = features.contains(SupportedFeature.CONFIG_DOCUMENTATION_RETRIEVAL) && includeDoc;
    // we need to partition calls, because it can lead to AdminClient timeouts in case of large topics count
    return partitionCalls(
        topicNames,
        200,
        part -> getTopicsConfigImpl(part, includeDocFixed),
        (m1, m2) -> ImmutableMap.<String, List<ConfigEntry>>builder().putAll(m1).putAll(m2).build()
    );
  }

  private Mono<Map<String, List<ConfigEntry>>> getTopicsConfigImpl(Collection<String> topicNames, boolean includeDoc) {
    List<ConfigResource> resources = topicNames.stream()
        .map(topicName -> new ConfigResource(ConfigResource.Type.TOPIC, topicName))
        .collect(toList());

    return toMonoWithExceptionFilter(
        client.describeConfigs(
            resources,
            new DescribeConfigsOptions().includeSynonyms(true).includeDocumentation(includeDoc)).values(),
        UnknownTopicOrPartitionException.class
    ).map(config -> config.entrySet().stream()
        .collect(toMap(
            c -> c.getKey().name(),
            c -> List.copyOf(c.getValue().entries()))));
  }

  private static Mono<Map<Integer, List<ConfigEntry>>> loadBrokersConfig(AdminClient client, List<Integer> brokerIds) {
    List<ConfigResource> resources = brokerIds.stream()
        .map(brokerId -> new ConfigResource(ConfigResource.Type.BROKER, Integer.toString(brokerId)))
        .collect(toList());
    return toMono(client.describeConfigs(resources).all())
        .doOnError(InvalidRequestException.class,
            th -> log.trace("Error while getting broker {} configs", brokerIds, th))
        // some kafka backends (like MSK serverless) do not support broker's configs retrieval,
        // in that case InvalidRequestException will be thrown
        .onErrorResume(InvalidRequestException.class, th -> Mono.just(Map.of()))
        .map(config -> config.entrySet().stream()
            .collect(toMap(
                c -> Integer.valueOf(c.getKey().name()),
                c -> new ArrayList<>(c.getValue().entries()))));
  }

  /**
   * Return per-broker configs or empty map if broker's configs retrieval not supported.
   */
  public Mono<Map<Integer, List<ConfigEntry>>> loadBrokersConfig(List<Integer> brokerIds) {
    return loadBrokersConfig(client, brokerIds);
  }

  public Mono<Map<String, TopicDescription>> describeTopics() {
    return listTopics(true).flatMap(this::describeTopics);
  }

  public Mono<Map<String, TopicDescription>> describeTopics(Collection<String> topics) {
    // we need to partition calls, because it can lead to AdminClient timeouts in case of large topics count
    return partitionCalls(
        topics,
        200,
        this::describeTopicsImpl,
        (m1, m2) -> ImmutableMap.<String, TopicDescription>builder().putAll(m1).putAll(m2).build()
    );
  }

  private Mono<Map<String, TopicDescription>> describeTopicsImpl(Collection<String> topics) {
    return toMonoWithExceptionFilter(
        client.describeTopics(topics).values(),
        UnknownTopicOrPartitionException.class
    );
  }

  /**
   * Returns TopicDescription mono, or Empty Mono if topic not found.
   */
  public Mono<TopicDescription> describeTopic(String topic) {
    return describeTopics(List.of(topic)).flatMap(m -> Mono.justOrEmpty(m.get(topic)));
  }

  /**
   * Kafka API often returns Map responses with KafkaFuture values. If we do allOf()
   * logic resulting Mono will be failing if any of Futures finished with error.
   * In some situations it is not what we want, ex. we call describeTopics(List names) method and
   * we getting UnknownTopicOrPartitionException for unknown topics and we what to just not put
   * such topics in resulting map.
   * <p/>
   * This method converts input map into Mono[Map] ignoring keys for which KafkaFutures
   * finished with <code>clazz</code> exception.
   */
  private <K, V> Mono<Map<K, V>> toMonoWithExceptionFilter(Map<K, KafkaFuture<V>> values,
                                                           Class<? extends KafkaException> clazz) {
    if (values.isEmpty()) {
      return Mono.just(Map.of());
    }

    List<Mono<Tuple2<K, V>>> monos = values.entrySet().stream()
        .map(e -> toMono(e.getValue()).map(r -> Tuples.of(e.getKey(), r)))
        .collect(toList());

    return Mono.create(sink -> {
      var finishedCnt = new AtomicInteger();
      var results = new ConcurrentHashMap<K, V>();
      monos.forEach(mono -> mono.subscribe(
          r -> {
            results.put(r.getT1(), r.getT2());
            if (finishedCnt.incrementAndGet() == monos.size()) {
              sink.success(results);
            }
          },
          th -> {
            if (!th.getClass().isAssignableFrom(clazz)) {
              sink.error(th);
            } else if (finishedCnt.incrementAndGet() == monos.size()) {
              sink.success(results);
            }
          }
      ));
    });
  }

  public Mono<Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>>> describeLogDirs() {
    return describeCluster()
        .map(d -> d.getNodes().stream().map(Node::id).collect(toList()))
        .flatMap(this::describeLogDirs);
  }

  public Mono<Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>>> describeLogDirs(
      Collection<Integer> brokerIds) {
    return toMono(client.describeLogDirs(brokerIds).all());
  }

  public Mono<ClusterDescription> describeCluster() {
    var r = client.describeCluster();
    var all = KafkaFuture.allOf(r.nodes(), r.clusterId(), r.controller(), r.authorizedOperations());
    return Mono.create(sink -> all.whenComplete((res, ex) -> {
      if (ex != null) {
        sink.error(ex);
      } else {
        try {
          sink.success(
              new ClusterDescription(
                  getUninterruptibly(r.controller()),
                  getUninterruptibly(r.clusterId()),
                  getUninterruptibly(r.nodes()),
                  getUninterruptibly(r.authorizedOperations())
              )
          );
        } catch (ExecutionException e) {
          // can't be here, because all futures already completed
        }
      }
    }));
  }

  private static Mono<String> getClusterVersion(AdminClient client) {
    return toMono(client.describeCluster().controller())
        .flatMap(controller -> loadBrokersConfig(client, List.of(controller.id())))
        .map(configs -> configs.values().stream()
            .flatMap(Collection::stream)
            .filter(entry -> entry.name().contains("inter.broker.protocol.version"))
            .findFirst()
            .map(ConfigEntry::value)
            .orElse("1.0-UNKNOWN")
        );
  }

  public Mono<Void> deleteConsumerGroups(Collection<String> groupIds) {
    return toMono(client.deleteConsumerGroups(groupIds).all())
        .onErrorResume(GroupIdNotFoundException.class,
            th -> Mono.error(new NotFoundException("The group id does not exist")))
        .onErrorResume(GroupNotEmptyException.class,
            th -> Mono.error(new IllegalEntityStateException("The group is not empty")));
  }

  public Mono<Void> createTopic(String name,
                                int numPartitions,
                                @Nullable Integer replicationFactor,
                                Map<String, String> configs) {
    var newTopic = new NewTopic(
        name,
        Optional.of(numPartitions),
        Optional.ofNullable(replicationFactor).map(Integer::shortValue)
    ).configs(configs);
    return toMono(client.createTopics(List.of(newTopic)).all());
  }

  public Mono<Void> alterPartitionReassignments(
      Map<TopicPartition, Optional<NewPartitionReassignment>> reassignments) {
    return toMono(client.alterPartitionReassignments(reassignments).all());
  }

  public Mono<Void> createPartitions(Map<String, NewPartitions> newPartitionsMap) {
    return toMono(client.createPartitions(newPartitionsMap).all());
  }

  public Mono<Void> updateTopicConfig(String topicName, Map<String, String> configs) {
    if (features.contains(SupportedFeature.INCREMENTAL_ALTER_CONFIGS)) {
      return incrementalAlterConfig(topicName, configs);
    } else {
      return alterConfig(topicName, configs);
    }
  }

  public Mono<List<String>> listConsumerGroups() {
    return toMono(client.listConsumerGroups().all())
        .map(lst -> lst.stream().map(ConsumerGroupListing::groupId).collect(toList()));
  }

  public Mono<Map<String, ConsumerGroupDescription>> describeConsumerGroups(Collection<String> groupIds) {
    return toMono(client.describeConsumerGroups(groupIds).all());
  }

  public Mono<Map<TopicPartition, Long>> listConsumerGroupOffsets(String groupId) {
    return listConsumerGroupOffsets(groupId, new ListConsumerGroupOffsetsOptions());
  }

  public Mono<Map<TopicPartition, Long>> listConsumerGroupOffsets(
      String groupId, List<TopicPartition> partitions) {
    return listConsumerGroupOffsets(groupId,
        new ListConsumerGroupOffsetsOptions().topicPartitions(partitions));
  }

  private Mono<Map<TopicPartition, Long>> listConsumerGroupOffsets(
      String groupId, ListConsumerGroupOffsetsOptions options) {
    return toMono(client.listConsumerGroupOffsets(groupId, options).partitionsToOffsetAndMetadata())
        .map(MapUtil::removeNullValues)
        .map(m -> m.entrySet().stream()
            .map(e -> Tuples.of(e.getKey(), e.getValue().offset()))
            .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2)));
  }

  public Mono<Void> alterConsumerGroupOffsets(String groupId, Map<TopicPartition, Long> offsets) {
    return toMono(client.alterConsumerGroupOffsets(
            groupId,
            offsets.entrySet().stream()
                .collect(toMap(Map.Entry::getKey, e -> new OffsetAndMetadata(e.getValue()))))
        .all());
  }

  public Mono<Map<TopicPartition, Long>> listOffsets(String topic,
                                                     OffsetSpec offsetSpec) {
    return topicPartitions(topic).flatMap(tps -> listOffsets(tps, offsetSpec));
  }

  public Mono<Map<TopicPartition, Long>> listOffsets(Collection<TopicPartition> partitions,
                                                     OffsetSpec offsetSpec) {
    //TODO: need to split this into multiple calls if number of target partitions is big
    return toMono(
        client.listOffsets(partitions.stream().collect(toMap(tp -> tp, tp -> offsetSpec))).all())
        .map(offsets -> offsets.entrySet()
            .stream()
            // filtering partitions for which offsets were not found
            .filter(e -> e.getValue().offset() >= 0)
            .collect(toMap(Map.Entry::getKey, e -> e.getValue().offset())));
  }

  public Mono<Collection<AclBinding>> listAcls() {
    Preconditions.checkArgument(features.contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    return toMono(client.describeAcls(AclBindingFilter.ANY).values());
  }

  public Mono<Void> createAcls(Collection<AclBinding> aclBindings) {
    Preconditions.checkArgument(features.contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    return toMono(client.createAcls(aclBindings).all());
  }

  public Mono<Void> deleteAcls(Collection<AclBinding> aclBindings) {
    Preconditions.checkArgument(features.contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    var filters = aclBindings.stream().map(AclBinding::toFilter).collect(Collectors.toSet());
    return toMono(client.deleteAcls(filters).all()).then();
  }

  private Mono<Set<TopicPartition>> topicPartitions(String topic) {
    return toMono(client.describeTopics(List.of(topic)).all())
        .map(r -> r.values().stream()
            .findFirst()
            .stream()
            .flatMap(d -> d.partitions().stream())
            .map(p -> new TopicPartition(topic, p.partition()))
            .collect(Collectors.toSet())
        );
  }

  public Mono<Void> updateBrokerConfigByName(Integer brokerId, String name, String value) {
    ConfigResource cr = new ConfigResource(ConfigResource.Type.BROKER, String.valueOf(brokerId));
    AlterConfigOp op = new AlterConfigOp(new ConfigEntry(name, value), AlterConfigOp.OpType.SET);
    return toMono(client.incrementalAlterConfigs(Map.of(cr, List.of(op))).all());
  }

  public Mono<Void> deleteRecords(Map<TopicPartition, Long> offsets) {
    var records = offsets.entrySet().stream()
        .map(entry -> Map.entry(entry.getKey(), RecordsToDelete.beforeOffset(entry.getValue())))
        .collect(toMap(Map.Entry::getKey, Map.Entry::getValue));
    return toMono(client.deleteRecords(records).all());
  }

  public Mono<Void> alterReplicaLogDirs(Map<TopicPartitionReplica, String> replicaAssignment) {
    return toMono(client.alterReplicaLogDirs(replicaAssignment).all());
  }

  private Mono<Void> incrementalAlterConfig(String topicName, Map<String, String> configs) {
    var config = configs.entrySet().stream()
        .flatMap(cfg -> Stream.of(
            new AlterConfigOp(
                new ConfigEntry(
                    cfg.getKey(),
                    cfg.getValue()),
                AlterConfigOp.OpType.SET)))
        .collect(toList());
    var topicResource = new ConfigResource(ConfigResource.Type.TOPIC, topicName);
    return toMono(client.incrementalAlterConfigs(Map.of(topicResource, config)).all());
  }

  @SuppressWarnings("deprecation")
  private Mono<Void> alterConfig(String topicName, Map<String, String> configs) {
    List<ConfigEntry> configEntries = configs.entrySet().stream()
        .flatMap(cfg -> Stream.of(new ConfigEntry(cfg.getKey(), cfg.getValue())))
        .collect(toList());
    Config config = new Config(configEntries);
    var topicResource = new ConfigResource(ConfigResource.Type.TOPIC, topicName);
    return toMono(client.alterConfigs(Map.of(topicResource, config)).all());
  }

  /**
   * Splits input collection into batches, applies each batch sequentially to function
   * and merges output Monos into one Mono.
   */
  private static <R, I> Mono<R> partitionCalls(Collection<I> items,
                                               int partitionSize,
                                               Function<Collection<I>, Mono<R>> call,
                                               BiFunction<R, R, R> merger) {
    if (items.isEmpty()) {
      return call.apply(items);
    }
    Iterator<List<I>> parts = Iterators.partition(items.iterator(), partitionSize);
    Mono<R> mono = call.apply(parts.next());
    while (parts.hasNext()) {
      var nextPart = parts.next();
      // calls will be executed sequentially
      mono = mono.flatMap(res1 -> call.apply(nextPart).map(res2 -> merger.apply(res1, res2)));
    }
    return mono;
  }

  @Override
  public void close() {
    client.close();
  }
}
