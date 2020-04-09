package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.common.TopicPartition;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
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

    public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroupDetail(String clusterName, String consumerGroupId) {
        KafkaCluster cluster = clustersStorage.getClusterByName(clusterName);
        ConsumerGroupDetails result = new ConsumerGroupDetails();
        result.setConsumerGroupId(consumerGroupId);
        result.setConsumers(new ArrayList<>());
        return ClusterUtil.toMono(cluster.getAdminClient().listConsumerGroups().all())
                .flatMap(s -> ClusterUtil.toMono(cluster.getAdminClient()
                        .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all()))
                .map(s -> {
                        s.get(consumerGroupId).members().forEach(s1 -> {
                            ConsumerDetail partlyResult = ClusterUtil.partlyConvertToConsumerDetail(s1, consumerGroupId, cluster);
                            result.getConsumers().add(partlyResult);
                    });
                    return result;
                })
                .flatMap(s -> ClusterUtil.toMono(cluster.getAdminClient().listConsumerGroupOffsets(consumerGroupId).partitionsToOffsetAndMetadata())
                        .map(o -> {
                            s.getConsumers().forEach(c -> {
                                List<Long> currentOffsets = new ArrayList<>();
                                List<Long> behindMessagesList = new ArrayList<>();
                                for (int i = 0; i < c.getTopic().size(); i++) {
                                    Long currentOffset = o.get(new TopicPartition(c.getTopic().get(i), c.getPartition().get(i))).offset();
                                    currentOffsets.add(currentOffset);
                                    behindMessagesList.add(c.getEndOffset().get(i) - currentOffset);
                                }
                                c.setCurrentOffset(currentOffsets);
                                c.setMessagesBehind(behindMessagesList);
                            });
                            return ResponseEntity.ok(s);
                        }));
    }

    @SneakyThrows
    public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroup (String clusterName) {
            var cluster = clustersStorage.getClusterByName(clusterName);
            return ClusterUtil.toMono(cluster.getAdminClient().listConsumerGroups().all())
                    .flatMap(s -> ClusterUtil.toMono(cluster.getAdminClient()
                            .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all()))
                    .map(s -> s.values().stream()
                            .map(c -> ClusterUtil.convertToConsumerGroup(c, cluster)).collect(Collectors.toList()))
                    .map(s -> ResponseEntity.ok(Flux.fromIterable(s)));
    }
}
