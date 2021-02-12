package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ApiClustersApi;
import com.provectus.kafka.ui.cluster.model.ConsumerPosition;
import com.provectus.kafka.ui.cluster.service.ClusterService;
import com.provectus.kafka.ui.cluster.service.SchemaRegistryService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

@RestController
@RequiredArgsConstructor
@Log4j2
public class MetricsRestController implements ApiClustersApi {

    private final ClusterService clusterService;
    private final SchemaRegistryService schemaRegistryService;

    @Override
    public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusterService.getClusters())));
    }

    @Override
    public Mono<ResponseEntity<BrokerMetrics>> getBrokersMetrics(String clusterName, Integer id, ServerWebExchange exchange) {
        return clusterService.getBrokerMetrics(clusterName, id)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @Override
    public Mono<ResponseEntity<ClusterMetrics>> getClusterMetrics(String clusterName, ServerWebExchange exchange) {
        return clusterService.getClusterMetrics(clusterName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @Override
    public Mono<ResponseEntity<ClusterStats>> getClusterStats(String clusterName, ServerWebExchange exchange) {
        return clusterService.getClusterStats(clusterName)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
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
    public Mono<ResponseEntity<Flux<TopicMessage>>> getTopicMessages(String clusterName, String topicName, @Valid SeekType seekType, @Valid List<String> seekTo, @Valid Integer limit, @Valid String q, ServerWebExchange exchange) {
        return parseConsumerPosition(seekType, seekTo)
                .map(consumerPosition -> ResponseEntity.ok(clusterService.getMessages(clusterName, topicName, consumerPosition, q, limit)));
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
    public Mono<ResponseEntity<SchemaSubject>> getLatestSchema(String clusterName, String subject, ServerWebExchange exchange) {
        return schemaRegistryService.getLatestSchemaSubject(clusterName, subject).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SchemaSubject>> getSchemaByVersion(String clusterName, String subject, Integer version, ServerWebExchange exchange) {
        return schemaRegistryService.getSchemaSubjectByVersion(clusterName, subject, version).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<SchemaSubject>>> getSchemas(String clusterName, ServerWebExchange exchange) {
        Flux<SchemaSubject> subjects = schemaRegistryService.getAllLatestVersionSchemas(clusterName);
        return Mono.just(ResponseEntity.ok(subjects));
    }

    @Override
    public Mono<ResponseEntity<Flux<SchemaSubject>>> getAllVersionsBySubject(String clusterName, String subjectName, ServerWebExchange exchange) {
        Flux<SchemaSubject> schemas = schemaRegistryService.getAllVersionsBySubject(clusterName, subjectName);
        return Mono.just(ResponseEntity.ok(schemas));
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteLatestSchema(String clusterName, String subject, ServerWebExchange exchange) {
        return schemaRegistryService.deleteLatestSchemaSubject(clusterName, subject);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteSchemaByVersion(String clusterName, String subjectName, Integer version, ServerWebExchange exchange) {
        return schemaRegistryService.deleteSchemaSubjectByVersion(clusterName, subjectName, version);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteSchema(String clusterName, String subjectName, ServerWebExchange exchange) {
        return schemaRegistryService.deleteSchemaSubject(clusterName, subjectName);
    }

    @Override
    public Mono<ResponseEntity<SchemaSubject>> createNewSchema(String clusterName, String subject,
                                                               @Valid Mono<NewSchemaSubject> newSchemaSubject,
                                                               ServerWebExchange exchange) {
        return schemaRegistryService.createNewSubject(clusterName, subject, newSchemaSubject);
    }

    @Override
    public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroup(String clusterName, String consumerGroupId, ServerWebExchange exchange) {
        return clusterService.getConsumerGroupDetail(clusterName, consumerGroupId).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Topic>> updateTopic(String clusterId, String topicName, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
        return clusterService.updateTopic(clusterId, topicName, topicFormData).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<CompatibilityLevel>> getGlobalSchemaCompatibilityLevel(String clusterName, ServerWebExchange exchange) {
        return schemaRegistryService.getGlobalSchemaCompatibilityLevel(clusterName)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @Override
    public Mono<ResponseEntity<Void>> updateGlobalSchemaCompatibilityLevel(String clusterName, @Valid Mono<CompatibilityLevel> compatibilityLevel, ServerWebExchange exchange) {
        log.info("Updating schema compatibility globally");
        return schemaRegistryService.updateSchemaCompatibility(clusterName, compatibilityLevel)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<CompatibilityCheckResponse>> checkSchemaCompatibility(String clusterName, String subject,
                                                                                     @Valid Mono<NewSchemaSubject> newSchemaSubject,
                                                                                     ServerWebExchange exchange) {
        return schemaRegistryService.checksSchemaCompatibility(clusterName, subject, newSchemaSubject)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> updateSchemaCompatibilityLevel(String clusterName, String subject, @Valid Mono<CompatibilityLevel> compatibilityLevel, ServerWebExchange exchange) {
        log.info("Updating schema compatibility for subject: {}", subject);
        return schemaRegistryService.updateSchemaCompatibility(clusterName, subject, compatibilityLevel)
                .map(ResponseEntity::ok);
    }

    private Mono<ConsumerPosition> parseConsumerPosition(SeekType seekType, List<String> seekTo) {
        return Mono.justOrEmpty(seekTo)
                .defaultIfEmpty(Collections.emptyList())
                .flatMapIterable(Function.identity())
                .map(p -> {
                    String[] splited = p.split("::");
                    if (splited.length != 2) {
                        throw new IllegalArgumentException("Wrong seekTo argument format. See API docs for details");
                    }

                    return Pair.of(Integer.parseInt(splited[0]), Long.parseLong(splited[1]));
                })
                .collectMap(Pair::getKey, Pair::getValue)
                .map(positions -> new ConsumerPosition(seekType != null ? seekType : SeekType.BEGINNING, positions));
    }
}
