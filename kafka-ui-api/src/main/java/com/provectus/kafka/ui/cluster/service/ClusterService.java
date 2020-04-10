package com.provectus.kafka.ui.cluster.service;

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

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClusterService {

    private final ClustersStorage clustersStorage;
    private final KafkaService kafkaService;

    public Mono<ResponseEntity<Flux<Cluster>>> getClusters() {
        List<Cluster> clusters = clustersStorage.getKafkaClusters()
                .stream()
                .map(KafkaCluster::getCluster)
                .collect(Collectors.toList());

        return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusters)));
    }

    public Mono<ResponseEntity<BrokersMetrics>> getBrokersMetrics(String name) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Mono.just(ResponseEntity.ok(cluster.getBrokersMetrics()));
    }

    public Mono<ResponseEntity<Flux<Topic>>> getTopics(String name) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(cluster.getTopics())));
    }

    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(String name, String topicName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Mono.just(ResponseEntity.ok(cluster.getOrCreateTopicDetails(topicName)));
    }

    public Mono<ResponseEntity<Flux<TopicConfig>>> getTopicConfigs(String name, String topicName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(cluster.getTopicConfigsMap().get(topicName))));
    }

    public Mono<ResponseEntity<Topic>> createTopic(String name, Mono<TopicFormData> topicFormData) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return kafkaService.createTopic(cluster, topicFormData);
    }

    public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroupDetail(String clusterName, String consumerGroupId) {
        KafkaCluster cluster = clustersStorage.getClusterByName(clusterName);

        return ClusterUtil.toMono(
                        cluster.getAdminClient()
                                .describeConsumerGroups(Collections.singletonList(consumerGroupId)).all()
                ).flatMap(groups ->
                        groupMetadata(cluster, consumerGroupId).map(
                            offsets -> {
                                Map<TopicPartition, Long> endOffsets = topicPartitionsEndOffsets(cluster, offsets.keySet());
                                return groups.get(consumerGroupId).members().stream()
                                        .flatMap(c -> ClusterUtil.convertToConsumerTopicPartitionDetails(c, offsets, endOffsets).stream())
                                        .collect(Collectors.toList());
                            }
                        )
                )
                .map(c -> new ConsumerGroupDetails().consumers(c).consumerGroupId(consumerGroupId))
                .map(ResponseEntity::ok);

    }

    public Mono<Map<TopicPartition, OffsetAndMetadata>> groupMetadata(KafkaCluster cluster, String consumerGroupId) {
        return ClusterUtil.toMono(
                cluster.getAdminClient().listConsumerGroupOffsets(consumerGroupId).partitionsToOffsetAndMetadata()
        );
    }

    public Map<TopicPartition, Long> topicPartitionsEndOffsets(KafkaCluster cluster, Collection<TopicPartition> topicPartitions) {
        Map<TopicPartition, Long> result;
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
    public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroups (String clusterName) {
            var cluster = clustersStorage.getClusterByName(clusterName);
            return ClusterUtil.toMono(cluster.getAdminClient().listConsumerGroups().all())
                    .flatMap(s ->
                            ClusterUtil.toMono(cluster.getAdminClient()
                                .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList()))
                                .all())
                    )
                    .map(s -> s.values().stream()
                            .map(c -> ClusterUtil.convertToConsumerGroup(c, cluster)).collect(Collectors.toList()))
                    .map(s -> ResponseEntity.ok(Flux.fromIterable(s)));
    }
}
