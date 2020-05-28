package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ApiClustersApi;
import com.provectus.kafka.ui.cluster.model.ConsumerPosition;
import com.provectus.kafka.ui.cluster.model.PartitionPosition;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@RestController
@RequiredArgsConstructor
public class MetricsRestController implements ApiClustersApi {

    private final ClusterService clusterService;

    @Override
    public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusterService.getClusters())));
    }

    @Override
    public Mono<ResponseEntity<BrokersMetrics>> getBrokersMetrics(String clusterName, ServerWebExchange exchange) {
        return Mono.just(
                clusterService.getBrokersMetrics(clusterName)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build())
        );
    }

    @Override
    public Mono<ResponseEntity<Flux<Topic>>> getTopics(String clusterName, ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusterService.getTopics(clusterName))));
    }

    @Override
    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(String clusterName, String topicName, ServerWebExchange exchange) {
        return Mono.just(
                clusterService.getTopicDetails(clusterName, topicName)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build())
        );
    }

    @Override
    public Mono<ResponseEntity<Flux<TopicConfig>>> getTopicConfigs(String clusterName, String topicName, ServerWebExchange exchange) {
        return Mono.just(
                clusterService.getTopicConfigs(clusterName, topicName)
                        .map(Flux::fromIterable)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build())
        );
    }

    @Override
    public Mono<ResponseEntity<Flux<TopicMessage>>> getTopicMessages(String clusterName, String topicName, @NotNull @Valid PositionType positionType, @Valid List<String> position, ServerWebExchange exchange) {
        return parseConsumerPosition(positionType, position)
                .map(consumerPosition -> ResponseEntity.ok(clusterService.getMessages(clusterName, topicName, consumerPosition)));
    }

    @Override
    public Mono<ResponseEntity<Topic>> createTopic(String clusterName, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
        return clusterService.createTopic(clusterName, topicFormData)
                .map(s -> new ResponseEntity<>(s, HttpStatus.OK))
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    @Override
    public Mono<ResponseEntity<Flux<Broker>>> getBrokers(String clusterName, ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(clusterService.getBrokers(clusterName)));
    }

    @Override
    public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroups(String clusterName, ServerWebExchange exchange) {
        return clusterService.getConsumerGroups(clusterName)
                .map(Flux::fromIterable)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build())); // TODO: check behaviour on cluster not found and empty groups list
    }

    @Override
    public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroup(String clusterName, String consumerGroupId, ServerWebExchange exchange) {
        return clusterService.getConsumerGroupDetail(clusterName, consumerGroupId).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Topic>> updateTopic(String clusterId, String topicName, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
        return clusterService.updateTopic(clusterId, topicName, topicFormData).map(ResponseEntity::ok);
    }
    
    private Mono<ConsumerPosition> parseConsumerPosition(PositionType positionType, List<String> positionParam) {
        return Flux.fromIterable(positionParam)
                .map(p -> {
                    String[] splited = p.split("::");
                    if (splited.length != 2) {
                        throw new IllegalArgumentException("Wrong position argument format. See API docs for details");
                    }

                    return new PartitionPosition(Integer.parseInt(splited[0]), Long.parseLong(splited[1]));
                })
                .collectList()
                .map(positions -> new ConsumerPosition(positionType, positions));
    }
}
