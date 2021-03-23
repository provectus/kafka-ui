package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.ClusterMetrics;
import com.provectus.kafka.ui.model.ClusterStats;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicConfig;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.TopicFormData;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.model.TopicsResponse;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ClusterService {
  private static final Integer DEFAULT_PAGE_SIZE = 20;

  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final KafkaService kafkaService;
  private final ConsumingService consumingService;

  public List<Cluster> getClusters() {
    return clustersStorage.getKafkaClusters()
        .stream()
        .map(clusterMapper::toCluster)
        .collect(Collectors.toList());
  }

  public Mono<BrokerMetrics> getBrokerMetrics(String name, Integer id) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(name)
        .map(c -> c.getMetrics().getInternalBrokerMetrics())
        .map(m -> m.get(id))
        .map(clusterMapper::toBrokerMetrics));
  }

  public Mono<ClusterStats> getClusterStats(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterStats)
    );
  }

  public Mono<ClusterMetrics> getClusterMetrics(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterMetrics)
    );
  }


  public TopicsResponse getTopics(String name, Optional<Integer> page,
                                  Optional<Integer> nullablePerPage) {
    Predicate<Integer> positiveInt = i -> i > 0;
    int perPage = nullablePerPage.filter(positiveInt).orElse(DEFAULT_PAGE_SIZE);
    var topicsToSkip = (page.filter(positiveInt).orElse(1) - 1) * perPage;
    var cluster = clustersStorage.getClusterByName(name)
        .orElseThrow(() -> new NotFoundException("No such cluster"));
    var totalPages = (cluster.getTopics().size() / perPage)
        + (cluster.getTopics().size() % perPage == 0 ? 0 : 1);
    return new TopicsResponse()
        .pageCount(totalPages)
        .topics(
            cluster.getTopics().values().stream()
                .sorted(Comparator.comparing(InternalTopic::getName))
                .skip(topicsToSkip)
                .limit(perPage)
                .map(clusterMapper::toTopic)
                .collect(Collectors.toList())
        );
  }

  public Optional<TopicDetails> getTopicDetails(String name, String topicName) {
    return clustersStorage.getClusterByName(name)
        .flatMap(c ->
            Optional.ofNullable(
                c.getTopics().get(topicName)
            ).map(
                t -> t.toBuilder().partitions(
                    kafkaService.getTopicPartitions(c, t)
                ).build()
            ).map(t -> clusterMapper.toTopicDetails(t, c.getMetrics()))
        );
  }

  public Optional<List<TopicConfig>> getTopicConfigs(String name, String topicName) {
    return clustersStorage.getClusterByName(name)
        .map(KafkaCluster::getTopics)
        .map(t -> t.get(topicName))
        .map(t -> t.getTopicConfigs().stream().map(clusterMapper::toTopicConfig)
            .collect(Collectors.toList()));
  }

  public Mono<Topic> createTopic(String clusterName, Mono<TopicFormData> topicFormData) {
    return clustersStorage.getClusterByName(clusterName).map(cluster ->
        kafkaService.createTopic(cluster, topicFormData)
            .doOnNext(t -> updateCluster(t, clusterName, cluster))
            .map(clusterMapper::toTopic)
    ).orElse(Mono.empty());
  }

  @SneakyThrows
  public Mono<ConsumerGroupDetails> getConsumerGroupDetail(String clusterName,
                                                           String consumerGroupId) {
    var cluster = clustersStorage.getClusterByName(clusterName).orElseThrow(Throwable::new);

    return kafkaService.getOrCreateAdminClient(cluster).map(ac ->
        ac.getAdminClient().describeConsumerGroups(Collections.singletonList(consumerGroupId)).all()
    ).flatMap(groups ->
        groupMetadata(cluster, consumerGroupId)
            .flatMap(offsets -> {
              Map<TopicPartition, Long> endOffsets =
                  topicPartitionsEndOffsets(cluster, offsets.keySet());
              return ClusterUtil.toMono(groups).map(s -> s.get(consumerGroupId).members().stream()
                  .flatMap(c -> Stream.of(ClusterUtil
                      .convertToConsumerTopicPartitionDetails(c, offsets, endOffsets)))
                  .collect(Collectors.toList()).stream()
                  .flatMap(t -> t.stream().flatMap(Stream::of)).collect(Collectors.toList()));
            })
    )
        .map(c -> new ConsumerGroupDetails().consumers(c).consumerGroupId(consumerGroupId));

  }

  public Mono<Map<TopicPartition, OffsetAndMetadata>> groupMetadata(KafkaCluster cluster,
                                                                    String consumerGroupId) {
    return
        kafkaService.getOrCreateAdminClient(cluster)
            .map(ac -> ac.getAdminClient().listConsumerGroupOffsets(consumerGroupId)
                .partitionsToOffsetAndMetadata())
            .flatMap(ClusterUtil::toMono);
  }

  public Map<TopicPartition, Long> topicPartitionsEndOffsets(
      KafkaCluster cluster, Collection<TopicPartition> topicPartitions) {
    Properties properties = new Properties();
    properties.putAll(cluster.getProperties());
    properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    properties.put(ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString());

    try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(properties)) {
      return consumer.endOffsets(topicPartitions);
    }
  }

  @SneakyThrows
  public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(kafkaService::getConsumerGroups)
        .orElse(Mono.empty());
  }

  public Flux<Broker> getBrokers(String clusterName) {
    return kafkaService
        .getOrCreateAdminClient(clustersStorage.getClusterByName(clusterName).orElseThrow())
        .flatMap(client -> ClusterUtil.toMono(client.getAdminClient().describeCluster().nodes())
            .map(n -> n.stream().map(node -> {
              Broker broker = new Broker();
              broker.setId(node.id());
              broker.setHost(node.host());
              return broker;
            }).collect(Collectors.toList())))
        .flatMapMany(Flux::fromIterable);
  }

  @SneakyThrows
  public Mono<Topic> updateTopic(String clusterName, String topicName,
                                 Mono<TopicFormData> topicFormData) {
    return clustersStorage.getClusterByName(clusterName).map(cl ->
        topicFormData
            .flatMap(t -> kafkaService.updateTopic(cl, topicName, t))
            .doOnNext(t -> updateCluster(t, clusterName, cl))
            .map(clusterMapper::toTopic)
    ).orElse(Mono.empty());
  }

  public Mono<Void> deleteTopic(String clusterName, String topicName) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(() -> new NotFoundException("No such cluster"));
    getTopicDetails(clusterName, topicName)
        .orElseThrow(() -> new NotFoundException("No such topic"));
    return kafkaService.deleteTopic(cluster, topicName)
        .doOnNext(t -> updateCluster(topicName, clusterName, cluster));
  }

  private KafkaCluster updateCluster(InternalTopic topic, String clusterName,
                                     KafkaCluster cluster) {
    final KafkaCluster updatedCluster = kafkaService.getUpdatedCluster(cluster, topic);
    clustersStorage.setKafkaCluster(clusterName, updatedCluster);
    return updatedCluster;
  }

  private KafkaCluster updateCluster(String topicToDelete, String clusterName,
                                     KafkaCluster cluster) {
    final KafkaCluster updatedCluster = kafkaService.getUpdatedCluster(cluster, topicToDelete);
    clustersStorage.setKafkaCluster(clusterName, updatedCluster);
    return updatedCluster;
  }

  public Flux<TopicMessage> getMessages(String clusterName, String topicName,
                                        ConsumerPosition consumerPosition, String query,
                                        Integer limit) {
    return clustersStorage.getClusterByName(clusterName)
        .map(c -> consumingService.loadMessages(c, topicName, consumerPosition, query, limit))
        .orElse(Flux.empty());
  }

  public Mono<Void> deleteTopicMessages(String clusterName, String topicName,
                                        List<Integer> partitions) {
    var cluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(() -> new NotFoundException("No such cluster"));
    if (!cluster.getTopics().containsKey(topicName)) {
      throw new NotFoundException("No such topic");
    }
    return consumingService.loadOffsets(cluster, topicName, partitions)
        .flatMap(offsets -> kafkaService.deleteTopicMessages(cluster, offsets));
  }
}
