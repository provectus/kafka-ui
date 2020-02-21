package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ApiClustersApi;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
public class MetricsRestController implements ApiClustersApi {

    private final ClusterService clusterService;

    @Override
    public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
        return clusterService.getClusters();
    }

    @Override
    public Mono<ResponseEntity<BrokersMetrics>> getBrokersMetrics(String clusterId, ServerWebExchange exchange) {
        return clusterService.getBrokersMetrics(clusterId);
    }

    @Override
    public Mono<ResponseEntity<Flux<Topic>>> getTopics(String clusterId, ServerWebExchange exchange) {
        return clusterService.getTopics(clusterId);
    }

    @Override
    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(String clusterId, String topicName, ServerWebExchange exchange) {
        return clusterService.getTopicDetails(clusterId, topicName);
    }

    @Override
    public Mono<ResponseEntity<Flux<TopicConfig>>> getTopicConfigs(String clusterId, String topicName, ServerWebExchange exchange) {
        return clusterService.getTopicConfigs(clusterId, topicName);
    }

    @Override
    public Mono<ResponseEntity<Topic>> createTopic(String clusterId, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
        return clusterService.createTopic(clusterId, topicFormData);
    }

    @Override
    public Mono<ResponseEntity<Flux<Broker>>> getBrokers(String clusterId, ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(new ArrayList<>())));
    }
}
