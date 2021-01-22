package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
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

    public Flux<String> getAllSchemaSubjects(String clusterName) {
        KafkaCluster kafkaCluster = clustersStorage.getClusterByName(clusterName).orElseThrow();
        WebClient webClient = WebClient.create(kafkaCluster.getSchemaRegistry());
        return webClient.get()
                .uri(URL_SUBJECTS)
                .retrieve()
                .bodyToFlux(String.class);
    }
}
