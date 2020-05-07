package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
                .flatMap(t -> kafkaService.getUpdatedCluster(cluster)
                    .map(c -> {
                        clustersStorage.setKafkaCluster(name, c);
                        return t;
                    })
                )
        ).orElse(Mono.empty()).map(clusterMapper::toTopic);
    }

    @SneakyThrows
    public Mono<ResponseEntity<Topic>> updateTopic(String clusterName, String topicName, Mono<TopicFormData> topicFormData) {
        return clustersStorage.getClusterByName(clusterName).map(cl ->
                    topicFormData.flatMap(t -> kafkaService.updateTopic(cl, topicName, t))
                            .flatMap(t -> kafkaService.getUpdatedCluster(cl)
                                    .map(c -> {
                                        clustersStorage.setKafkaCluster(clusterName, c);
                                        return t;
                                    })
                    .map(ResponseEntity::ok)))
                .orElse(Mono.empty());
    }

    @SneakyThrows
    public Mono<List<ConsumerGroup>> getConsumerGroups(String clusterName) {
            return clustersStorage.getClusterByName(clusterName)
                    .map(kafkaService::getConsumerGroups)
                    .orElse(Mono.empty());
    }
}
