package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SubjectSchema;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryService {
    public static final String URL_SUBJECTS = "/subjects";
    public static final String URL_SUBJECT = "/subjects/{subjectName}";
    public static final String URL_SUBJECT_VERSIONS = "/subjects/{subjectName}/versions";
    public static final String URL_SUBJECT_BY_VERSION = "/subjects/{subjectName}/versions/{version}";

    private final ClustersStorage clustersStorage;
    private final WebClient webClient;

    public Flux<String> getAllSchemaSubjects(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECTS)
                        .retrieve()
                        .bodyToFlux(String.class))
                .orElse(Flux.empty());
    }

    public Flux<Integer> getSchemaSubjectVersions(String clusterName, String subjectName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, subjectName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject")))
                        .bodyToFlux(Integer.class))
                .orElse(Flux.empty());
    }

    public Flux<SubjectSchema> getSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, subjectName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .bodyToFlux(SubjectSchema.class))
                .orElse(Flux.empty());
    }

    public Mono<Object> deleteSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_BY_VERSION, subjectName, version)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .bodyToMono(Object.class))
                .orElse(Mono.empty());
    }

    public Mono<Object> deleteSchemaSubject(String clusterName, String subjectName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT, subjectName)
                        .retrieve()
                        .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                        .bodyToMono(Object.class))
                .orElse(Mono.empty());
    }

    public Mono<ResponseEntity<SubjectSchema>> createNewSubject(String clusterName, String subjectSchema, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getSchemaRegistry() + URL_SUBJECT_VERSIONS, subjectSchema)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                        .retrieve()
                        .toEntity(SubjectSchema.class))
                .orElse(Mono.empty());
    }
}
