package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clusters")
public class MetricsRestController implements ClustersApi {

    private final ClusterService clusterService;

    @GetMapping("/{clusterId}/brokers")
    public void getBrokers(@PathVariable("clusterId") String clusterId) {
        //TODO: currently isn't displayed on UI, to do later
    }

    @Override
    @GetMapping
    public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
        return clusterService.getClusters();
    }

    @Override
    @GetMapping("/{clusterId}/metrics/broker")
    public Mono<ResponseEntity<BrokerMetrics>> getBrokersMetrics(@PathVariable String clusterId, ServerWebExchange exchange) {
        return clusterService.getBrokerMetrics(clusterId);
    }

    @Override
    @GetMapping("/{clusterId}/topics")
    public Mono<ResponseEntity<Flux<Topic>>> getTopics(@PathVariable String clusterId, ServerWebExchange exchange) {
        return clusterService.getTopics(clusterId);
    }

    @Override
    @GetMapping("/{clusterId}/topics/{topicName}")
    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(@PathVariable("clusterId") String clusterId,
                                                              @PathVariable("topicName") String topicName, ServerWebExchange exchange) {
        return clusterService.getTopicDetails(clusterId, topicName);
    }

    @PostMapping("/{clusterId}/topics")
    public void createTopic(@PathVariable("clusterId") String clusterId) {

    }

    @PutMapping("/{clusterId}/topics/{topicId}")
    public void putTopic(@PathVariable("clusterId") String clusterId,
                         @PathVariable("topicId") String topicId) {
    }
}
