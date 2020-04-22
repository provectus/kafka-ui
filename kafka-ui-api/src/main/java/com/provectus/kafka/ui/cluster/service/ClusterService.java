package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
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

    public Flux<Cluster> getClusters() {
        List<Cluster> clusters = clustersStorage.getKafkaClusters()
                .stream()
                .map(KafkaCluster::getCluster)
                .collect(Collectors.toList());

        return Flux.fromIterable(clusters);
    }

    public BrokersMetrics getBrokersMetrics(String name) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return cluster.getBrokersMetrics();
    }

    public Flux<Topic> getTopics(String name) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Flux.fromIterable(cluster.getTopics());
    }

    public TopicDetails getTopicDetails(String name, String topicName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return cluster.getOrCreateTopicDetails(topicName);
    }

    public Flux<TopicConfig> getTopicConfigs(String name, String topicName) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        return Flux.fromIterable(cluster.getTopicConfigsMap().get(topicName));
    }

    public Mono<Topic> createTopic(String name, Mono<TopicFormData> topicFormData) {
        KafkaCluster cluster = clustersStorage.getClusterByName(name);
        if (cluster == null) return null;
        var adminClient = kafkaService.createAdminClient(cluster);
        return kafkaService.createTopic(adminClient, cluster, topicFormData);
    }

    @SneakyThrows
    public Flux<ConsumerGroup> getConsumerGroup (String clusterName) {
            var cluster = clustersStorage.getClusterByName(clusterName);
            var adminClient =  kafkaService.createAdminClient(cluster);
            return ClusterUtil.toMono(adminClient.listConsumerGroups().all())
                    .flatMap(s -> ClusterUtil.toMono(adminClient
                            .describeConsumerGroups(s.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList())).all()))
                    .map(s -> s.values().stream()
                            .map(c -> ClusterUtil.convertToConsumerGroup(c, cluster)).collect(Collectors.toList()))
                    .flatMapIterable(s -> s);
    }
}
