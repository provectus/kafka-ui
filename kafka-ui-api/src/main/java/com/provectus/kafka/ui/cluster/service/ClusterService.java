package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ClusterService {

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

    public Optional<BrokersMetrics> getBrokersMetrics(String name) {
        return clustersStorage.getClusterByName(name)
                .map(KafkaCluster::getMetrics)
                .map(clusterMapper::toBrokerMetrics);
    }

    public List<Topic> getTopics(String name) {
        return clustersStorage.getClusterByName(name)
                .map( c ->
                        c.getTopics().values().stream()
                                .map(clusterMapper::toTopic)
                                .collect(Collectors.toList())
                ).orElse(Collections.emptyList());
    }

    public Optional<TopicDetails> getTopicDetails(String name, String topicName) {
        return clustersStorage.getClusterByName(name)
                .map(KafkaCluster::getTopics)
                .map(t -> t.get(topicName))
                .map(clusterMapper::toTopicDetails);
    }

    public Optional<List<TopicConfig>> getTopicConfigs(String name, String topicName) {
        return clustersStorage.getClusterByName(name)
                .map(KafkaCluster::getTopics)
                .map(t -> t.get(topicName))
                .map(t -> t.getTopicConfigs().stream().map(clusterMapper::toTopicConfig).collect(Collectors.toList()));
    }

    public Mono<Topic> createTopic(String name, Mono<TopicFormData> topicFormData) {
        return clustersStorage.getClusterByName(name).map(
                cluster -> kafkaService.createTopic(cluster, topicFormData)
        ).orElse(Mono.empty()).map(clusterMapper::toTopic);
    }

    @SneakyThrows
    public Mono<ConsumerGroupDetails> getConsumerGroupDetail(String clusterName, String consumerGroupId) {
        var cluster = clustersStorage.getClusterByName(clusterName).orElseThrow(Throwable::new);

        return kafkaService.getOrCreateAdminClient(cluster).map(ac ->
                                ac.describeConsumerGroups(Collections.singletonList(consumerGroupId)).all()
            ).flatMap(groups ->
                groupMetadata(cluster, consumerGroupId)
                    .flatMap(offsets -> {
                        Map<TopicPartition, Long> endOffsets = topicPartitionsEndOffsets(cluster, offsets.keySet());
                            return ClusterUtil.toMono(groups).map(s -> s.get(consumerGroupId).members().stream()
                                        .flatMap(c -> Stream.of(ClusterUtil.convertToConsumerTopicPartitionDetails(c, offsets, endOffsets)))
                                    .collect(Collectors.toList()).stream().flatMap(t -> t.stream().flatMap(Stream::of)).collect(Collectors.toList()));
                    })
            )
            .map(c -> new ConsumerGroupDetails().consumers(c).consumerGroupId(consumerGroupId));

    }

    public Mono<Map<TopicPartition, OffsetAndMetadata>> groupMetadata(KafkaCluster cluster, String consumerGroupId) {
        return
                kafkaService.getOrCreateAdminClient(cluster)
                        .map(ac -> ac.listConsumerGroupOffsets(consumerGroupId).partitionsToOffsetAndMetadata())
                        .flatMap(ClusterUtil::toMono);
    }

    public Map<TopicPartition, Long> topicPartitionsEndOffsets(KafkaCluster cluster, Collection<TopicPartition> topicPartitions) {
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString());

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(properties)) {
            return consumer.endOffsets(topicPartitions);
        }
    }

    @SneakyThrows
    public Mono<List<ConsumerGroup>> getConsumerGroups (String clusterName) {
            return clustersStorage.getClusterByName(clusterName)
                    .map(kafkaService::getConsumerGroups)
                    .orElse(Mono.empty());

//        var cluster = clustersStorage.getClusterByName(clusterName).orElseThrow(Throwable::new);
//            return kafkaService.getOrCreateAdminClient(cluster).map(ac -> ac.listConsumerGroups().all())
//                    .flatMap(s ->
//                            kafkaService.getOrCreateAdminClient(cluster).flatMap(ac ->
//                                ClusterUtil.toMono(s).map(s1 -> s1.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).map(ac::describeConsumerGroups)
//                    ))
//                    .flatMap(s -> ClusterUtil.toMono(s.all()).map(details -> details.values().stream()
//                            .map(c -> ClusterUtil.convertToConsumerGroup(c, cluster)).collect(Collectors.toList())));
    }

    public Flux<Broker> getBrokers (String clusterName) {
        return kafkaService.getOrCreateAdminClient(clustersStorage.getClusterByName(clusterName).orElseThrow())
                .flatMap(client -> ClusterUtil.toMono(client.describeCluster().nodes())
                    .map(n -> n.stream().map(node -> {
                        Broker broker = new Broker();
                        broker.setId(node.idString());
                        return broker;
                    }).collect(Collectors.toList())))
                .flatMapMany(Flux::fromIterable);
    }

    public Flux<TopicMessage> getMessages(String clusterName, String topicName, Integer partition, Long offset, OffsetDateTime timestamp) {
        return clustersStorage.getClusterByName(clusterName)
                .map(c -> consumingService.loadMessages(c, topicName))
                .orElse(Flux.empty());

    }
}
