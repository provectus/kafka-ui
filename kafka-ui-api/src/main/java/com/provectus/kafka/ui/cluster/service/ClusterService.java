package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
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

    @SneakyThrows
    public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroup (String clusterName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(clusterName);
        List<ConsumerGroup> consumerGroups = new ArrayList<>();
        List<String> stringIds = cluster.getAdminClient().listConsumerGroups().all().get().stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList());
        Map<String, ConsumerGroupDescription> consumerGroupDescription = cluster.getAdminClient().describeConsumerGroups(stringIds).all().get();
        consumerGroupDescription.entrySet().forEach(s -> {
            ConsumerGroup consumerGroup = new ConsumerGroup();
            consumerGroup.setClusterId(cluster.getCluster().getId());
            consumerGroup.setConsumerGroupId(s.getValue().groupId());
            consumerGroup.setNumConsumers(s.getValue().members().size());
            Set<String> topics = new HashSet<>();
            s.getValue().members().forEach(s1 -> s1.assignment().topicPartitions().forEach(s2 -> topics.add(s2.topic())));
            consumerGroup.setNumTopics(topics.size());
            consumerGroups.add(consumerGroup);
        });
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(consumerGroups)));
    }
}
