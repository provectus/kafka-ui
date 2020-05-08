package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClusterService {

    private final ClustersStorage clustersStorage;
    private final ClusterMapper clusterMapper;
    private final KafkaService kafkaService;

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
        return clustersStorage.getClusterByName(name).flatMap(
                c -> Optional.ofNullable(c.getTopics().get(topicName))
        ).map(clusterMapper::toTopicDetails);
    }

    public Optional<List<TopicConfig>> getTopicConfigs(String name, String topicName) {
        return clustersStorage.getClusterByName(name).flatMap(
                c -> Optional.ofNullable(c.getTopics().get(topicName))
        ).map( t -> t.getTopicConfigs().stream().map(clusterMapper::toTopicConfig).collect(Collectors.toList()));
    }

    public Mono<Topic> createTopic(String name, Mono<TopicFormData> topicFormData) {
        return clustersStorage.getClusterByName(name).map(
                cluster -> kafkaService.createTopic(cluster, topicFormData)
        ).orElse(Mono.empty()).map(clusterMapper::toTopic);
    }

    @SneakyThrows
    public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName) {
            return clustersStorage.getClusterByName(clusterName)
                    .map(kafkaService::getConsumerGroups)
                    .orElse(Mono.empty());
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
}
