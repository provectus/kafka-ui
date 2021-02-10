package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.model.Connector;
import com.provectus.kafka.ui.model.ConnectorConfig;
import com.provectus.kafka.ui.model.ConnectorStatus;
import com.provectus.kafka.ui.model.NewConnector;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
    private final ClustersStorage clustersStorage;
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

    public Mono<Connector> createConnector(String clusterName, Mono<NewConnector> connector) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/")
                        .body(BodyInserters.fromPublisher(connector, NewConnector.class))
                        .retrieve()
                        .bodyToMono(Connector.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
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

    public Mono<ConnectorConfig> getConnectorConfig(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/config")
                        .retrieve()
                        .bodyToMono(ConnectorConfig.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> deleteConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ConnectorStatus> getConnectorStatus(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/status")
                        .retrieve()
                        .bodyToMono(ConnectorStatus.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> restartConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/restart")
                        .retrieve()
                        .bodyToMono(Void.class)
                        // todo onstatus 409
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> pauseConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/pause")
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> resumeConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/resume")
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }
}
