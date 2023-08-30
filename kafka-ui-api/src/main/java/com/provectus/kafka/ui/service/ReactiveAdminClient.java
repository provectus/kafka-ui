package com.provectus.kafka.ui.service;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.apache.kafka.clients.admin.ListOffsetsResult.ListOffsetsResultInfo;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableTable;
import com.google.common.collect.Iterables;
import com.google.common.collect.Table;
import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.util.KafkaVersion;
import com.provectus.kafka.ui.util.annotation.KafkaClientInternalsDependant;
import java.io.Closeable;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
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
import java.util.stream.IntStream;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.DescribeClusterOptions;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.apache.kafka.clients.admin.DescribeConfigsOptions;
import org.apache.kafka.clients.admin.ListConsumerGroupOffsetsSpec;
import org.apache.kafka.clients.admin.ListOffsetsResult;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.admin.NewPartitionReassignment;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.ProducerState;
import org.apache.kafka.clients.admin.RecordsToDelete;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaException;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.TopicPartitionInfo;
import org.apache.kafka.common.TopicPartitionReplica;
import org.apache.kafka.common.acl.AccessControlEntryFilter;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclBindingFilter;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.errors.ClusterAuthorizationException;
import org.apache.kafka.common.errors.GroupIdNotFoundException;
import org.apache.kafka.common.errors.GroupNotEmptyException;
import org.apache.kafka.common.errors.InvalidRequestException;
import org.apache.kafka.common.errors.SecurityDisabledException;
import org.apache.kafka.common.errors.TopicAuthorizationException;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.errors.UnsupportedVersionException;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.apache.kafka.common.resource.ResourcePatternFilter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;


@Slf4j
@AllArgsConstructor
public class ReactiveAdminClient implements Closeable {

  public enum SupportedFeature {
    INCREMENTAL_ALTER_CONFIGS(2.3f),
    CONFIG_DOCUMENTATION_RETRIEVAL(2.6f),
    DESCRIBE_CLUSTER_INCLUDE_AUTHORIZED_OPERATIONS(2.3f),
    AUTHORIZED_SECURITY_ENABLED(ReactiveAdminClient::isAuthorizedSecurityEnabled);

    private final BiFunction<AdminClient, Float, Mono<Boolean>> predicate;

    SupportedFeature(BiFunction<AdminClient, Float, Mono<Boolean>> predicate) {
      this.predicate = predicate;
    }

    SupportedFeature(float fromVersion) {
      this.predicate = (admin, ver) -> Mono.just(ver != null && ver >= fromVersion);
    }

    static Mono<Set<SupportedFeature>> forVersion(AdminClient ac, String kafkaVersionStr) {
      @Nullable Float kafkaVersion = KafkaVersion.parse(kafkaVersionStr).orElse(null);
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
    @Nullable // null, if ACL is disabled
    Set<AclOperation> authorizedOperations;
  }

  @Builder
  private record ConfigRelatedInfo(String version,
                                   Set<SupportedFeature> features,
                                   boolean topicDeletionIsAllowed) {

    static final Duration UPDATE_DURATION = Duration.of(1, ChronoUnit.HOURS);

    private static Mono<ConfigRelatedInfo> extract(AdminClient ac) {
      return ReactiveAdminClient.describeClusterImpl(ac, Set.of())
          .flatMap(desc -> {
            // choosing node from which we will get configs (starting with controller)
            var targetNodeId = Optional.ofNullable(desc.controller)
                .map(Node::id)
                .orElse(desc.getNodes().iterator().next().id());
            return loadBrokersConfig(ac, List.of(targetNodeId))
                .map(map -> map.isEmpty() ? List.<ConfigEntry>of() : map.get(targetNodeId))
                .flatMap(configs -> {
                  String version = "1.0-UNKNOWN";
                  boolean topicDeletionEnabled = true;
                  for (ConfigEntry entry : configs) {
                    if (entry.name().contains("inter.broker.protocol.version")) {
                      version = entry.value();
                    }
                    if (entry.name().equals("delete.topic.enable")) {
                      topicDeletionEnabled = Boolean.parseBoolean(entry.value());
                    }
                  }
                  final String finalVersion = version;
                  final boolean finalTopicDeletionEnabled = topicDeletionEnabled;
                  return SupportedFeature.forVersion(ac, version)
                      .map(features -> new ConfigRelatedInfo(finalVersion, features, finalTopicDeletionEnabled));
                });
          })
          .cache(UPDATE_DURATION);
    }
  }

  public static Mono<ReactiveAdminClient> create(AdminClient adminClient) {
    Mono<ConfigRelatedInfo> configRelatedInfoMono = ConfigRelatedInfo.extract(adminClient);
    return configRelatedInfoMono.map(info -> new ReactiveAdminClient(adminClient, configRelatedInfoMono, info));
  }


  private static Mono<Boolean> isAuthorizedSecurityEnabled(AdminClient ac, @Nullable Float kafkaVersion) {
    return toMono(ac.describeAcls(AclBindingFilter.ANY).values())
        .thenReturn(true)
        .doOnError(th -> !(th instanceof SecurityDisabledException)
                && !(th instanceof InvalidRequestException)
                && !(th instanceof UnsupportedVersionException),
            th -> log.debug("Error checking if security enabled", th))
        .onErrorReturn(false);
  }

  // NOTE: if KafkaFuture returns null, that Mono will be empty(!), since Reactor does not support nullable results
  // (see MonoSink.success(..) javadoc for details)
  public static <T> Mono<T> toMono(KafkaFuture<T> future) {
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
  private final Mono<ConfigRelatedInfo> configRelatedInfoMono;

  private volatile ConfigRelatedInfo configRelatedInfo;

  public Set<SupportedFeature> getClusterFeatures() {
    return configRelatedInfo.features();
  }

  public Mono<Set<String>> listTopics(boolean listInternal) {
    return toMono(client.listTopics(new ListTopicsOptions().listInternal(listInternal)).names());
  }

  public Mono<Void> deleteTopic(String topicName) {
    return toMono(client.deleteTopics(List.of(topicName)).all());
  }

  public String getVersion() {
    return configRelatedInfo.version();
  }

  public boolean isTopicDeletionEnabled() {
    return configRelatedInfo.topicDeletionIsAllowed();
  }

  public Mono<Void> updateInternalStats(@Nullable Node controller) {
    if (controller == null) {
      return Mono.empty();
    }
    return configRelatedInfoMono
        .doOnNext(info -> this.configRelatedInfo = info)
        .then();
  }

  public Mono<Map<String, List<ConfigEntry>>> getTopicsConfig() {
    return listTopics(true).flatMap(topics -> getTopicsConfig(topics, false));
  }

  //NOTE: skips not-found topics (for which UnknownTopicOrPartitionException was thrown by AdminClient)
  //and topics for which DESCRIBE_CONFIGS permission is not set (TopicAuthorizationException was thrown)
  public Mono<Map<String, List<ConfigEntry>>> getTopicsConfig(Collection<String> topicNames, boolean includeDoc) {
    var includeDocFixed = includeDoc && getClusterFeatures().contains(SupportedFeature.CONFIG_DOCUMENTATION_RETRIEVAL);
    // we need to partition calls, because it can lead to AdminClient timeouts in case of large topics count
    return partitionCalls(
        topicNames,
        200,
        part -> getTopicsConfigImpl(part, includeDocFixed),
        mapMerger()
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
        UnknownTopicOrPartitionException.class,
        TopicAuthorizationException.class
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
        // some kafka backends don't support broker's configs retrieval,
        // and throw various exceptions on describeConfigs() call
        .onErrorResume(th -> th instanceof InvalidRequestException // MSK Serverless
                || th instanceof UnknownTopicOrPartitionException, // Azure event hub
            th -> {
              log.trace("Error while getting configs for brokers {}", brokerIds, th);
              return Mono.just(Map.of());
            })
        // there are situations when kafka-ui user has no DESCRIBE_CONFIGS permission on cluster
        .onErrorResume(ClusterAuthorizationException.class, th -> {
          log.trace("AuthorizationException while getting configs for brokers {}", brokerIds, th);
          return Mono.just(Map.of());
        })
        // catching all remaining exceptions, but logging on WARN level
        .onErrorResume(th -> true, th -> {
          log.warn("Unexpected error while getting configs for brokers {}", brokerIds, th);
          return Mono.just(Map.of());
        })
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
        mapMerger()
    );
  }

  private Mono<Map<String, TopicDescription>> describeTopicsImpl(Collection<String> topics) {
    return toMonoWithExceptionFilter(
        client.describeTopics(topics).topicNameValues(),
        UnknownTopicOrPartitionException.class,
        // we only describe topics that we see from listTopics() API, so we should have permission to do it,
        // but also adding this exception here for rare case when access restricted after we called listTopics()
        TopicAuthorizationException.class
    );
  }

  /**
   * Returns TopicDescription mono, or Empty Mono if topic not visible.
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
   * finished with <code>classes</code> exceptions and empty Monos.
   */
  @SafeVarargs
  static <K, V> Mono<Map<K, V>> toMonoWithExceptionFilter(Map<K, KafkaFuture<V>> values,
                                                          Class<? extends KafkaException>... classes) {
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
                    th -> Stream.of(classes).anyMatch(clazz -> th.getClass().isAssignableFrom(clazz)),
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
    return toMono(client.describeLogDirs(brokerIds).all())
        .onErrorResume(UnsupportedVersionException.class, th -> Mono.just(Map.of()))
        .onErrorResume(ClusterAuthorizationException.class, th -> Mono.just(Map.of()))
        .onErrorResume(th -> true, th -> {
          log.warn("Error while calling describeLogDirs", th);
          return Mono.just(Map.of());
        });
  }

  public Mono<ClusterDescription> describeCluster() {
    return describeClusterImpl(client, getClusterFeatures());
  }

  private static Mono<ClusterDescription> describeClusterImpl(AdminClient client, Set<SupportedFeature> features) {
    boolean includeAuthorizedOperations =
        features.contains(SupportedFeature.DESCRIBE_CLUSTER_INCLUDE_AUTHORIZED_OPERATIONS);
    DescribeClusterResult result = client.describeCluster(
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
    if (getClusterFeatures().contains(SupportedFeature.INCREMENTAL_ALTER_CONFIGS)) {
      return getTopicsConfigImpl(List.of(topicName), false)
          .map(conf -> conf.getOrDefault(topicName, List.of()))
          .flatMap(currentConfigs -> incrementalAlterConfig(topicName, currentConfigs, configs));
    } else {
      return alterConfig(topicName, configs);
    }
  }

  public Mono<List<String>> listConsumerGroupNames() {
    return listConsumerGroups().map(lst -> lst.stream().map(ConsumerGroupListing::groupId).toList());
  }

  public Mono<Collection<ConsumerGroupListing>> listConsumerGroups() {
    return toMono(client.listConsumerGroups().all());
  }

  public Mono<Map<String, ConsumerGroupDescription>> describeConsumerGroups(Collection<String> groupIds) {
    return partitionCalls(
        groupIds,
        25,
        4,
        ids -> toMono(client.describeConsumerGroups(ids).all()),
        mapMerger()
    );
  }

  // group -> partition -> offset
  // NOTE: partitions with no committed offsets will be skipped
  public Mono<Table<String, TopicPartition, Long>> listConsumerGroupOffsets(List<String> consumerGroups,
                                                                            // all partitions if null passed
                                                                            @Nullable List<TopicPartition> partitions) {
    Function<Collection<String>, Mono<Map<String, Map<TopicPartition, OffsetAndMetadata>>>> call =
        groups -> toMono(
            client.listConsumerGroupOffsets(
                groups.stream()
                    .collect(Collectors.toMap(
                        g -> g,
                        g -> new ListConsumerGroupOffsetsSpec().topicPartitions(partitions)
                    ))).all()
        );

    Mono<Map<String, Map<TopicPartition, OffsetAndMetadata>>> merged = partitionCalls(
        consumerGroups,
        25,
        4,
        call,
        mapMerger()
    );

    return merged.map(map -> {
      var table = ImmutableTable.<String, TopicPartition, Long>builder();
      map.forEach((g, tpOffsets) -> tpOffsets.forEach((tp, offset) -> {
        if (offset != null) {
          // offset will be null for partitions that don't have committed offset for this group
          table.put(g, tp, offset.offset());
        }
      }));
      return table.build();
    });
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

  /**
   * List offset for the specified topics, skipping no-leader partitions.
   */
  public Mono<Map<TopicPartition, Long>> listOffsets(Collection<TopicDescription> topicDescriptions,
                                                     OffsetSpec offsetSpec) {
    return listOffsetsUnsafe(filterPartitionsWithLeaderCheck(topicDescriptions, p -> true, false), offsetSpec);
  }

  private Mono<Collection<TopicPartition>> filterPartitionsWithLeaderCheck(Collection<TopicPartition> partitions,
                                                                           boolean failOnUnknownLeader) {
    var targetTopics = partitions.stream().map(TopicPartition::topic).collect(Collectors.toSet());
    return describeTopicsImpl(targetTopics)
        .map(descriptions ->
            filterPartitionsWithLeaderCheck(
                descriptions.values(), partitions::contains, failOnUnknownLeader));
  }

  @VisibleForTesting
  static Set<TopicPartition> filterPartitionsWithLeaderCheck(Collection<TopicDescription> topicDescriptions,
                                                              Predicate<TopicPartition> partitionPredicate,
                                                              boolean failOnUnknownLeader) {
    var goodPartitions = new HashSet<TopicPartition>();
    for (TopicDescription description : topicDescriptions) {
      var goodTopicPartitions = new ArrayList<TopicPartition>();
      for (TopicPartitionInfo partitionInfo : description.partitions()) {
        TopicPartition topicPartition = new TopicPartition(description.name(), partitionInfo.partition());
        if (partitionInfo.leader() == null) {
          if (failOnUnknownLeader) {
            throw new ValidationException(String.format("Topic partition %s has no leader", topicPartition));
          } else {
            // if ANY of topic partitions has no leader - we have to skip all topic partitions
            goodTopicPartitions.clear();
            break;
          }
        }
        if (partitionPredicate.test(topicPartition)) {
          goodTopicPartitions.add(topicPartition);
        }
      }
      goodPartitions.addAll(goodTopicPartitions);
    }
    return goodPartitions;
  }

  // 1. NOTE(!): should only apply for partitions from topics where all partitions have leaders,
  //    otherwise AdminClient will try to fetch topic metadata, fail and retry infinitely (until timeout)
  // 2. NOTE(!): Skips partitions that were not initialized yet
  //    (UnknownTopicOrPartitionException thrown, ex. after topic creation)
  // 3. TODO: check if it is a bug that AdminClient never throws LeaderNotAvailableException and just retrying instead
  @KafkaClientInternalsDependant
  @VisibleForTesting
  Mono<Map<TopicPartition, Long>> listOffsetsUnsafe(Collection<TopicPartition> partitions, OffsetSpec offsetSpec) {
    if (partitions.isEmpty()) {
      return Mono.just(Map.of());
    }

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
        mapMerger()
    );
  }

  public Mono<Collection<AclBinding>> listAcls(ResourcePatternFilter filter) {
    Preconditions.checkArgument(getClusterFeatures().contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    return toMono(client.describeAcls(new AclBindingFilter(filter, AccessControlEntryFilter.ANY)).values());
  }

  public Mono<Void> createAcls(Collection<AclBinding> aclBindings) {
    Preconditions.checkArgument(getClusterFeatures().contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    return toMono(client.createAcls(aclBindings).all());
  }

  public Mono<Void> deleteAcls(Collection<AclBinding> aclBindings) {
    Preconditions.checkArgument(getClusterFeatures().contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED));
    var filters = aclBindings.stream().map(AclBinding::toFilter).collect(Collectors.toSet());
    return toMono(client.deleteAcls(filters).all()).then();
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

  // returns tp -> list of active producer's states (if any)
  public Mono<Map<TopicPartition, List<ProducerState>>> getActiveProducersState(String topic) {
    return describeTopic(topic)
        .map(td -> client.describeProducers(
                IntStream.range(0, td.partitions().size())
                    .mapToObj(i -> new TopicPartition(topic, i))
                    .toList()
            ).all()
        )
        .flatMap(ReactiveAdminClient::toMono)
        .map(map -> map.entrySet().stream()
            .filter(e -> !e.getValue().activeProducers().isEmpty()) // skipping partitions without producers
            .collect(toMap(Map.Entry::getKey, e -> e.getValue().activeProducers())));
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
   * Splits input collection into batches, converts each batch into Mono, sequentially subscribes to them
   * and merges output Monos into one Mono.
   */
  private static <R, I> Mono<R> partitionCalls(Collection<I> items,
                                               int partitionSize,
                                               Function<Collection<I>, Mono<R>> call,
                                               BiFunction<R, R, R> merger) {
    if (items.isEmpty()) {
      return call.apply(items);
    }
    Iterable<List<I>> parts = Iterables.partition(items, partitionSize);
    return Flux.fromIterable(parts)
        .concatMap(call)
        .reduce(merger);
  }

  /**
   * Splits input collection into batches, converts each batch into Mono, subscribes to them (concurrently,
   * with specified concurrency level) and merges output Monos into one Mono.
   */
  private static <R, I> Mono<R> partitionCalls(Collection<I> items,
                                               int partitionSize,
                                               int concurrency,
                                               Function<Collection<I>, Mono<R>> call,
                                               BiFunction<R, R, R> merger) {
    if (items.isEmpty()) {
      return call.apply(items);
    }
    Iterable<List<I>> parts = Iterables.partition(items, partitionSize);
    return Flux.fromIterable(parts)
        .flatMap(call, concurrency)
        .reduce(merger);
  }

  private static <K, V> BiFunction<Map<K, V>, Map<K, V>, Map<K, V>> mapMerger() {
    return (m1, m2) -> {
      var merged = new HashMap<K, V>();
      merged.putAll(m1);
      merged.putAll(m2);
      return merged;
    };
  }

  @Override
  public void close() {
    client.close();
  }
}
