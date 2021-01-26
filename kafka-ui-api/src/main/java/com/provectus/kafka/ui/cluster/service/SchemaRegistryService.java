package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.SubjectSchema;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryService {
    private final ClustersStorage clustersStorage;
    public static final String URL_SUBJECTS = "/subjects";
    public static final String URL_SUBJECT_VERSIONS = "/subjects/{subjectName}/versions";
    public static final String URL_SUBJECT = "/subjects/{subjectName}/versions/{version}";

    public Flux<String> getAllSchemaSubjects(String clusterName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
//        todo: use it as a bean
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECTS)
                .retrieve()
                .bodyToFlux(String.class);
    }

    public Flux<Integer> getSchemaSubjectVersions(String clusterName, String subjectName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
//        todo: use it as a bean
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECT_VERSIONS, subjectName)
                .retrieve()
                .bodyToFlux(Integer.class);
    }

    public Flux<SubjectSchema> getSchemaSubjectByVersion(String clusterName, String subjectName, Integer version) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECT, subjectName, version)
                .retrieve()
                .bodyToFlux(SubjectSchema.class);
    }
}
