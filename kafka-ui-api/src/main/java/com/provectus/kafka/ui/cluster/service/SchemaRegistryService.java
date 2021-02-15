package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.InternalCompatibilityCheck;
import com.provectus.kafka.ui.cluster.model.InternalCompatibilityLevel;
import com.provectus.kafka.ui.model.CompatibilityCheckResponse;
import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SchemaSubject;
import java.util.Formatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryService {
    private static final String URL_SUBJECTS = "/subjects";
    private static final String URL_SUBJECT = "/subjects/{schemaName}";
    private static final String URL_SUBJECT_VERSIONS = "/subjects/{schemaName}/versions";
    private static final String URL_SUBJECT_BY_VERSION = "/subjects/{schemaName}/versions/{version}";
    private static final String LATEST = "latest";

    private final ClustersStorage clustersStorage;
    private final ClusterMapper mapper;
    private final WebClient webClient;

    public Flux<SchemaSubject> getAllLatestVersionSchemas(String clusterName) {
        var allSubjectNames = getAllSubjectNames(clusterName);
        return allSubjectNames
                .flatMapMany(Flux::fromArray)
                .flatMap(subject -> getLatestSchemaSubject(clusterName, subject));
    }

    public Mono<String[]> getAllSubjectNames(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECTS)
                        .retrieve()
                        .bodyToMono(String[].class)
                        .doOnError(log::error)
                )
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Flux<SchemaSubject> getAllVersionsBySubject(String clusterName, String subject) {
        Flux<Integer> versions = getSubjectVersions(clusterName, subject);
        return versions.flatMap(version -> getSchemaSubjectByVersion(clusterName, subject, version));
    }

    private Flux<Integer> getSubjectVersions(String clusterName, String schemaName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, schemaName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                            resp -> Mono.error(
                                new NotFoundException(formatted("No such schema %s"))
                            )
                        ).bodyToFlux(Integer.class)
                ).orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<SchemaSubject> getSchemaSubjectByVersion(String clusterName, String schemaName, Integer version) {
        return this.getSchemaSubject(clusterName, schemaName, String.valueOf(version));
    }

    public Mono<SchemaSubject> getLatestSchemaSubject(String clusterName, String schemaName) {
        return this.getSchemaSubject(clusterName, schemaName, LATEST);
    }

    private Mono<SchemaSubject> getSchemaSubject(String clusterName, String schemaName, String version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, schemaName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                                resp -> Mono.error(
                                    new NotFoundException(
                                        formatted("No such schema %s with version %s", schemaName, version)
                                    )
                                )
                        ).bodyToMono(SchemaSubject.class)
                        .zipWith(getSchemaCompatibilityInfoOrGlobal(clusterName, schemaName))
                        .map(tuple -> {
                            SchemaSubject schema = tuple.getT1();
                            String compatibilityLevel = tuple.getT2().getCompatibility().getValue();
                            schema.setCompatibilityLevel(compatibilityLevel);
                            return schema;
                        })
                )
                .orElseThrow();
    }

    public Mono<ResponseEntity<Void>> deleteSchemaSubjectByVersion(String clusterName, String schemaName, Integer version) {
        return this.deleteSchemaSubject(clusterName, schemaName, String.valueOf(version));
    }

    public Mono<ResponseEntity<Void>> deleteLatestSchemaSubject(String clusterName, String schemaName) {
        return this.deleteSchemaSubject(clusterName, schemaName, LATEST);
    }

    private Mono<ResponseEntity<Void>> deleteSchemaSubject(String clusterName, String schemaName, String version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, schemaName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                                resp -> Mono.error(
                                    new NotFoundException(
                                        formatted("No such schema %s with version %s", schemaName, version)
                                    )
                                )
                        ).toBodilessEntity()
                ).orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ResponseEntity<Void>> deleteSchemaSubject(String clusterName, String schemaName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT, schemaName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                            resp -> Mono.error(
                                new NotFoundException(
                                    formatted("No such schema %s", schemaName)
                                )
                            )
                        )
                        .toBodilessEntity())
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ResponseEntity<SchemaSubject>> createNewSubject(String clusterName, String schemaName, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, schemaName)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                                resp -> Mono.error(
                                    new NotFoundException(formatted("No such schema %s", schemaName)))
                        )
                        .toEntity(SchemaSubject.class)
                        .log())
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    /**
     * Updates a compatibility level for a <code>schemaName</code>
     *
     * @param schemaName is a schema subject name
     * @see com.provectus.kafka.ui.model.CompatibilityLevel.CompatibilityEnum
     */
    public Mono<Void> updateSchemaCompatibility(String clusterName, String schemaName, Mono<CompatibilityLevel> compatibilityLevel) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> {
                    String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
                    return webClient.put()
                            .uri(cluster.getSchemaRegistry() + configEndpoint, schemaName)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(BodyInserters.fromPublisher(compatibilityLevel, CompatibilityLevel.class))
                            .retrieve()
                            .onStatus(HttpStatus.NOT_FOUND::equals,
                                    resp -> Mono.error(new NotFoundException(formatted("No such schema %s", schemaName))))
                            .bodyToMono(Void.class);
                }).orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> updateSchemaCompatibility(String clusterName, Mono<CompatibilityLevel> compatibilityLevel) {
        return updateSchemaCompatibility(clusterName, null, compatibilityLevel);
    }

    public Mono<CompatibilityLevel> getSchemaCompatibilityLevel(String clusterName, String schemaName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> {
                    String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
                    return webClient.get()
                            .uri(cluster.getSchemaRegistry() + configEndpoint, schemaName)
                            .retrieve()
                            .bodyToMono(InternalCompatibilityLevel.class)
                            .map(mapper::toCompatibilityLevel)
                            .onErrorResume(error -> Mono.empty());
                }).orElse(Mono.empty());
    }

    public Mono<CompatibilityLevel> getGlobalSchemaCompatibilityLevel(String clusterName) {
        return this.getSchemaCompatibilityLevel(clusterName, null);
    }

    private Mono<CompatibilityLevel> getSchemaCompatibilityInfoOrGlobal(String clusterName, String schemaName) {
        return this.getSchemaCompatibilityLevel(clusterName, schemaName)
                .switchIfEmpty(this.getGlobalSchemaCompatibilityLevel(clusterName));
    }

    public Mono<CompatibilityCheckResponse> checksSchemaCompatibility(String clusterName, String schemaName, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getSchemaRegistry() + "/compatibility/subjects/{schemaName}/versions/latest", schemaName)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals,
                                resp -> Mono.error(new NotFoundException(formatted("No such schema %s", schemaName))))
                        .bodyToMono(InternalCompatibilityCheck.class)
                        .map(mapper::toCompatibilityCheckResponse)
                        .log()
                ).orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public String formatted(String str, Object... args) {
        return new Formatter().format(str, args).toString();
    }
}
