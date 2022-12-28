package com.provectus.kafka.ui.service;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.apache.kafka.clients.admin.ListOffsetsResult.ListOffsetsResultInfo;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterators;
import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.util.MapUtil;
import com.provectus.kafka.ui.util.NumberUtil;
import com.provectus.kafka.ui.util.annotation.KafkaClientInternalsDependant;
import java.io.Closeable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.DescribeClusterOptions;
import org.apache.kafka.clients.admin.DescribeConfigsOptions;
import org.apache.kafka.clients.admin.ListConsumerGroupOffsetsOptions;
import org.apache.kafka.clients.admin.ListOffsetsResult;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.RecordsToDelete;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaException;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.TopicPartitionInfo;
import org.apache.kafka.common.TopicPartitionReplica;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.errors.GroupIdNotFoundException;
import org.apache.kafka.common.errors.GroupNotEmptyException;
import org.apache.kafka.common.errors.InvalidRequestException;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;


@Slf4j
@RequiredArgsConstructor
public class ReactiveAdminClient implements Closeable {

  private enum SupportedFeature {
    INCREMENTAL_ALTER_CONFIGS(2.3f),
    CONFIG_DOCUMENTATION_RETRIEVAL(2.6f),
    DESCRIBE_CLUSTER_INCLUDE_AUTHORIZED_OPERATIONS(2.3f);

    private final float sinceVersion;

    SupportedFeature(float sinceVersion) {
      this.sinceVersion = sinceVersion;
    }

    static Set<SupportedFeature> forVersion(float kafkaVersion) {
      return Arrays.stream(SupportedFeature.values())
          .filter(f -> kafkaVersion >= f.sinceVersion)
          .collect(Collectors.toSet());
    }

    static Set<SupportedFeature> defaultFeatures() {
      return Set.of();
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
        .map(ver ->
            new ReactiveAdminClient(
                adminClient,
                ver,
                getSupportedUpdateFeaturesForVersion(ver)));
  }

  private static Set<SupportedFeature> getSupportedUpdateFeaturesForVersion(String versionStr) {
    try {
      float version = NumberUtil.parserClusterVersion(versionStr);
      return SupportedFeature.forVersion(version);
    } catch (NumberFormatException e) {
      return SupportedFeature.defaultFeatures();
    }
  }

  // NOTE: if KafkaFuture returns null, that Mono will be empty(!), since Reactor does not support nullable results
  // (see MonoSink.success(..) javadoc for details)
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

  @Getter(AccessLevel.PACKAGE) // visible for testing
  private final AdminClient client;
  private final String version;
  private final Set<SupportedFeature> features;

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

  //NOTE: skips not-found topics (for which UnknownTopicOrPartitionException was thrown by AdminClient)
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
   * finished with <code>clazz</code> exception and empty Monos.
   */
  static <K, V> Mono<Map<K, V>> toMonoWithExceptionFilter(Map<K, KafkaFuture<V>> values,
                                                          Class<? extends KafkaException> clazz) {
    if (values.isEmpty()) {
      return Mono.just(Map.of());
    }

    List<Mono<Tuple2<K, Optional<V>>>> monos = values.entrySet().stream()
        .map(e ->
            toMono(e.getValue())
                .map(r -> Tuples.of(e.getKey(), Optional.of(r)))
                .defaultIfEmpty(Tuples.of(e.getKey(), Optional.empty())) //tracking empty Monos
                .onErrorResume(
                    // tracking Monos with suppressible error
                    th -> th.getClass().isAssignableFrom(clazz),
                    th -> Mono.just(Tuples.of(e.getKey(), Optional.empty()))))
        .toList();

    return Mono.zip(
        monos,
        resultsArr -> Stream.of(resultsArr)
            .map(obj -> (Tuple2<K, Optional<V>>) obj)
            .filter(t -> t.getT2().isPresent()) //skipping empty & suppressible-errors
            .collect(Collectors.toMap(Tuple2::getT1, t -> t.getT2().get()))
    );
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
    return describeClusterImpl(client, features);
  }

  private static Mono<ClusterDescription> describeClusterImpl(AdminClient client, Set<SupportedFeature> features) {
    var includeAuthorizedOperations = features.contains(SupportedFeature.DESCRIBE_CLUSTER_INCLUDE_AUTHORIZED_OPERATIONS);
    var result = client.describeCluster(
        new DescribeClusterOptions().includeAuthorizedOperations(includeAuthorizedOperations));
    var allOfFuture = KafkaFuture.allOf(
        result.controller(), result.clusterId(), result.nodes(), result.authorizedOperations());
    return toMono(allOfFuture).then(
        Mono.fromCallable(() ->
          new ClusterDescription(
            result.controller().get(),
            result.clusterId().get(),
            result.nodes().get(),
            result.authorizedOperations().get()
          )
        )
    );
  }

  private static Mono<String> getClusterVersion(AdminClient client) {
    return describeClusterImpl(client, Set.of())
        // choosing node from which we will get configs (starting with controller)
        .flatMap(descr -> descr.controller != null
            ? Mono.just(descr.controller)
            : Mono.justOrEmpty(descr.nodes.stream().findFirst())
        )
        .flatMap(node -> loadBrokersConfig(client, List.of(node.id())))
        .flatMap(configs -> configs.values().stream()
            .flatMap(Collection::stream)
            .filter(entry -> entry.name().contains("inter.broker.protocol.version"))
            .findFirst()
            .map(configEntry -> Mono.just(configEntry.value()))
            .orElse(Mono.empty()))
        .switchIfEmpty(Mono.just("1.0-UNKNOWN"));
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


  // NOTE: places whole current topic config with new one. Entries that were present in old config,
  // but missed in new will be set to default
  public Mono<Void> updateTopicConfig(String topicName, Map<String, String> configs) {
    if (features.contains(SupportedFeature.INCREMENTAL_ALTER_CONFIGS)) {
      return getTopicsConfigImpl(List.of(topicName), false)
          .map(conf -> conf.getOrDefault(topicName, List.of()))
          .flatMap(currentConfigs -> incrementalAlterConfig(topicName, currentConfigs, configs));
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

  /**
   * List offset for the topic's partitions and OffsetSpec.
   *
   * @param failOnUnknownLeader true - throw exception in case of no-leader partitions,
   *                            false - skip partitions with no leader
   */
  public Mono<Map<TopicPartition, Long>> listTopicOffsets(String topic,
                                                          OffsetSpec offsetSpec,
                                                          boolean failOnUnknownLeader) {
    return describeTopic(topic)
        .map(td -> filterPartitionsWithLeaderCheck(List.of(td), p -> true, failOnUnknownLeader))
        .flatMap(partitions -> listOffsetsUnsafe(partitions, offsetSpec));
  }

  /**
   * List offset for the specified partitions and OffsetSpec.
   *
   * @param failOnUnknownLeader true - throw exception in case of no-leader partitions,
   *                            false - skip partitions with no leader
   */
  public Mono<Map<TopicPartition, Long>> listOffsets(Collection<TopicPartition> partitions,
                                                     OffsetSpec offsetSpec,
                                                     boolean failOnUnknownLeader) {
    return filterPartitionsWithLeaderCheck(partitions, failOnUnknownLeader)
        .flatMap(parts -> listOffsetsUnsafe(parts, offsetSpec));
  }

  private Mono<Collection<TopicPartition>> filterPartitionsWithLeaderCheck(Collection<TopicPartition> partitions,
                                                                           boolean failOnUnknownLeader) {
    var targetTopics = partitions.stream().map(TopicPartition::topic).collect(Collectors.toSet());
    return describeTopicsImpl(targetTopics)
        .map(descriptions ->
            filterPartitionsWithLeaderCheck(
                descriptions.values(), partitions::contains, failOnUnknownLeader));
  }

  private Set<TopicPartition> filterPartitionsWithLeaderCheck(Collection<TopicDescription> topicDescriptions,
                                                              Predicate<TopicPartition> partitionPredicate,
                                                              boolean failOnUnknownLeader) {
    var goodPartitions = new HashSet<TopicPartition>();
    for (TopicDescription description : topicDescriptions) {
      for (TopicPartitionInfo partitionInfo : description.partitions()) {
        TopicPartition topicPartition = new TopicPartition(description.name(), partitionInfo.partition());
        if (!partitionPredicate.test(topicPartition)) {
          continue;
        }
        if (partitionInfo.leader() != null) {
          goodPartitions.add(topicPartition);
        } else if (failOnUnknownLeader) {
          throw new ValidationException(String.format("Topic partition %s has no leader", topicPartition));
        }
      }
    }
    return goodPartitions;
  }

  // 1. NOTE(!): should only apply for partitions with existing leader,
  //    otherwise AdminClient will try to fetch topic metadata, fail and retry infinitely (until timeout)
  // 2. NOTE(!): Skips partitions that were not initialized yet
  //    (UnknownTopicOrPartitionException thrown, ex. after topic creation)
  // 3. TODO: check if it is a bug that AdminClient never throws LeaderNotAvailableException and just retrying instead
  @KafkaClientInternalsDependant
  public Mono<Map<TopicPartition, Long>> listOffsetsUnsafe(Collection<TopicPartition> partitions,
                                                           OffsetSpec offsetSpec) {

    Function<Collection<TopicPartition>, Mono<Map<TopicPartition, Long>>> call =
        parts -> {
          ListOffsetsResult r = client.listOffsets(parts.stream().collect(toMap(tp -> tp, tp -> offsetSpec)));
          Map<TopicPartition, KafkaFuture<ListOffsetsResultInfo>> perPartitionResults = new HashMap<>();
          parts.forEach(p -> perPartitionResults.put(p, r.partitionResult(p)));

          return toMonoWithExceptionFilter(perPartitionResults, UnknownTopicOrPartitionException.class)
              .map(offsets -> offsets.entrySet().stream()
                  // filtering partitions for which offsets were not found
                  .filter(e -> e.getValue().offset() >= 0)
                  .collect(toMap(Map.Entry::getKey, e -> e.getValue().offset())));
        };

    return partitionCalls(
        partitions,
        200,
        call,
        (m1, m2) -> ImmutableMap.<TopicPartition, Long>builder().putAll(m1).putAll(m2).build()
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

  private Mono<Void> incrementalAlterConfig(String topicName,
                                            List<ConfigEntry> currentConfigs,
                                            Map<String, String> newConfigs) {
    var configsToDelete = currentConfigs.stream()
        .filter(e -> e.source() == ConfigEntry.ConfigSource.DYNAMIC_TOPIC_CONFIG) //manually set configs only
        .filter(e -> !newConfigs.containsKey(e.name()))
        .map(e -> new AlterConfigOp(e, AlterConfigOp.OpType.DELETE));

    var configsToSet = newConfigs.entrySet().stream()
        .map(e -> new AlterConfigOp(new ConfigEntry(e.getKey(), e.getValue()), AlterConfigOp.OpType.SET));

    return toMono(client.incrementalAlterConfigs(
        Map.of(
            new ConfigResource(ConfigResource.Type.TOPIC, topicName),
            Stream.concat(configsToDelete, configsToSet).toList()
        )).all());
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
