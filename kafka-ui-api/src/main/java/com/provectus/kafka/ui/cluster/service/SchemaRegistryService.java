package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Service
@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryService {
    private static final String URL_SUBJECTS = "/subjects";
    private static final String URL_SUBJECT = "/subjects/{subjectName}";
    private static final String URL_SUBJECT_VERSIONS = "/subjects/{subjectName}/versions";
    private static final String URL_SUBJECT_BY_VERSION = "/subjects/{subjectName}/versions/{version}";
    private static final String LATEST = "latest";

    private final ClustersStorage clustersStorage;
    private final ClusterMapper mapper;
    private final WebClient webClient;

    public Flux<String> getAllSchemaSubjects(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECTS)
                        .retrieve()
                        .onStatus(HttpStatus::is5xxServerError, ClientResponse::createException)
                        .bodyToFlux(String.class)
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Flux<Integer> getSchemaSubjectVersions(String clusterName, String subjectName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, subjectName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject")))
                        .bodyToFlux(Integer.class))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Flux<SchemaSubject> getSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        return this.getSchemaSubject(clusterName, subjectName, String.valueOf(version));
    }

    public Flux<SchemaSubject> getLatestSchemaSubject(String clusterName, String subjectName) {
        return this.getSchemaSubject(clusterName, subjectName, LATEST);
    }

    private Flux<SchemaSubject> getSchemaSubject(String clusterName, String subjectName, String version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, subjectName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .bodyToFlux(SchemaSubject.class))
                .orElse(Flux.error(new NotFoundException()));
    }

    public Mono<ResponseEntity<Void>> deleteSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        return this.deleteSchemaSubject(clusterName, subjectName, String.valueOf(version));
    }

    public Mono<ResponseEntity<Void>> deleteLatestSchemaSubject(String clusterName, String subjectName) {
        return this.deleteSchemaSubject(clusterName, subjectName, LATEST);
    }

    private Mono<ResponseEntity<Void>> deleteSchemaSubject(String clusterName, String subjectName, String version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, subjectName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .toBodilessEntity())
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ResponseEntity<Void>> deleteSchemaSubject(String clusterName, String subjectName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT, subjectName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .toBodilessEntity())
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ResponseEntity<SchemaSubject>> createNewSubject(String clusterName, String subjectSchema, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, subjectSchema)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                        .retrieve()
                        .onStatus(HttpStatus::isError, ClientResponse::createException)
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
                            .bodyToMono(Void.class);
                }).orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> updateSchemaCompatibility(String clusterName, Mono<CompatibilityLevel> compatibilityLevel) {
        return updateSchemaCompatibility(clusterName, null, compatibilityLevel);
    }

    public Mono<CompatibilityLevelResponse> getSchemaCompatibilityLevel(String clusterName, String schemaName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> {
                    String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
                    return webClient.get()
                            .uri(cluster.getSchemaRegistry() + configEndpoint, schemaName)
                            .retrieve()
                            .bodyToMono(CompatibilityLevelResponse.class);
                }).orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<CompatibilityCheckResponse> checksSchemaCompatibility(String clusterName, String schemaName, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getSchemaRegistry() + "/compatibility/subjects/{subjectName}/versions/latest", schemaName)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                        .retrieve()
                        .bodyToMono(InternalCompatibilityCheck.class)
                        .map(mapper::toCompatibilityCheckResponse)
                        .log()
                ).orElse(Mono.error(new NotFoundException("No such cluster")));
    }
}
