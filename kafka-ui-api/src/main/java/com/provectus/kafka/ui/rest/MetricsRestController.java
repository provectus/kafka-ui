package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class MetricsRestController implements ClustersApi {

    private final ClusterService clusterService;

    @Override
    public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
        return clusterService.getClusters();
    }

    @Override
    public Mono<ResponseEntity<BrokerMetrics>> getBrokersMetrics(String clusterId, ServerWebExchange exchange) {
        return clusterService.getBrokerMetrics(clusterId);
    }

    @Override
    public Mono<ResponseEntity<Flux<Topic>>> getTopics(String clusterId, ServerWebExchange exchange) {
        return clusterService.getTopics(clusterId);
    }

    @Override
    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(String clusterId, String topicName, ServerWebExchange exchange) {
        return clusterService.getTopicDetails(clusterId, topicName);
    }
}
