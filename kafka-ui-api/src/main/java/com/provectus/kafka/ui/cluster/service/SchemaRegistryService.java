package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
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
    private final ClustersStorage clustersStorage;
    public static final String URL_SUBJECTS = "/subjects";
    public static final String URL_SUBJECT = "/subjects/{subjectName}";
    public static final String URL_SUBJECT_VERSIONS = "/subjects/{subjectName}/versions";
    public static final String URL_SUBJECT_BY_VERSION = "/subjects/{subjectName}/versions/{version}";

    public Flux<String> getAllSchemaSubjects(String clusterName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECTS)
                .retrieve()
                .bodyToFlux(String.class);
    }

    public Flux<Integer> getSchemaSubjectVersions(String clusterName, String subjectName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECT_VERSIONS, subjectName)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject")))
                .bodyToFlux(Integer.class);
    }

    public Flux<SubjectSchema> getSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECT_BY_VERSION, subjectName, version)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                .bodyToFlux(SubjectSchema.class);
    }

    public Mono<Object> deleteSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.delete()
                .uri(URL_SUBJECT_BY_VERSION, subjectName, version)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                .bodyToMono(Object.class);
    }

    public Mono<Object> deleteSchemaSubject(String clusterName, String subjectName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.delete()
                .uri(URL_SUBJECT, subjectName)
                .retrieve()
                .onStatus(HttpStatus.NOT_FOUND::equals, resp -> Mono.error(new NotFoundException("No such subject or version")))
                .bodyToMono(Object.class);
    }

    public Mono<ResponseEntity<SubjectSchema>> createNewSubject(String clusterName, String subjectSchema, Mono<NewSchemaSubject> newSchemaSubject) {
        return clustersStorage.getClusterByName(clusterName)
                .map(kafkaCluster -> WebClient.create(kafkaCluster.getSchemaRegistry()))
                .map(webClient -> webClient
                                .post()
                                .uri(URL_SUBJECT_VERSIONS, subjectSchema)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
                                .retrieve()
                                .toEntity(SubjectSchema.class)
                )
                .orElse(Mono.empty());
    }
}
