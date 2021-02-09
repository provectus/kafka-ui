package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.model.Connector;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
    private final ClustersStorage clustersStorage;
    private final ClusterMapper mapper;
    private final WebClient webClient;

    public Flux<String> getConnectors(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors")
                        .retrieve()
                        .bodyToFlux(String.class)
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<Connector> getConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName)
                        .retrieve()
                        .bodyToMono(Connector.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }


}
