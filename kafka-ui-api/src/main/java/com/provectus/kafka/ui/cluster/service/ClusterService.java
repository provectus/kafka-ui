package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.common.KafkaFuture;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    private <T> Mono<T> toMono(KafkaFuture<T> future){
        return Mono.create(sink-> future.whenComplete((res, ex)->{
            if(ex!=null) {
                sink.error(ex);
            } else {
                sink.success(res);
            }
        }));
    }

    @SneakyThrows
    public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroup (String clusterName) {
                    var cluster = clustersStorage.getClusterByName(clusterName);
                    return toMono(cluster.getAdminClient().listConsumerGroups().all())
                            .map(s -> cluster.getAdminClient().describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all())
                            .flatMap(s -> {
                                return toMono(s).map(c -> {
                                    ArrayList<ConsumerGroup> result = new ArrayList<>();
                                    c.values().forEach(c1 -> {
                                    ConsumerGroup consumerGroup = new ConsumerGroup();
                                    consumerGroup.setClusterId(cluster.getCluster().getId());
                                    consumerGroup.setConsumerGroupId(c1.groupId());
                                    consumerGroup.setNumConsumers(c1.members().size());
                                    Set<String> topics = new HashSet<>();
                                    c1.members().forEach(s1 -> s1.assignment().topicPartitions().forEach(s2 -> topics.add(s2.topic())));
                                    consumerGroup.setNumTopics(topics.size());
                                    result.add(consumerGroup);
                                });
                                    return result;
                                });
                            }).map(s -> {
                                return ResponseEntity.ok(Flux.fromIterable(s));
                            });
    }
}
