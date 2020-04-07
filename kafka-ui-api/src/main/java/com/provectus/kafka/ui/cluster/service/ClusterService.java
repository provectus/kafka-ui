package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerGroupMetadata;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.KafkaFuture;
import org.apache.zookeeper.ZooKeeper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
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

    public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroupDetail(String topicId, String clusterName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(clusterName);
        var partition = cluster.getTopicDetailsMap().get(topicId).getPartitionCount();
//        ClusterUtil.toMono(cluster.getAdminClient().listConsumerGroups().all())
//                .flatMap(s -> ClusterUtil.toMono(cluster.getAdminClient()
//                        .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all()))
        cluster.getAdminClient().describeConsumerGroups().all().get().get("").members()
                .forEach(s -> {
                    s.assignment().topicPartitions().forEach(t -> t.partition()); //partition
                    s.assignment().topicPartitions().forEach(t -> t.topic());//topic
                });
        cluster.getAdminClient().describeTopics().all().get().get("").partitions().get(0).;
        cluster.getAdminClient().listConsumerGroupOffsets("").partitionsToOffsetAndMetadata().get().get("").offset();
    }
}
