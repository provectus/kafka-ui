package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.util.List;
import java.util.Map;

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
                        .bodyToMono(new ParameterizedTypeReference<List<String>>() {
                        })
                        .flatMapMany(Flux::fromIterable)
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<Tuple2<Connector, String>> createConnector(String clusterName, Mono<NewConnector> connector) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/")
                        .body(BodyInserters.fromPublisher(connector, NewConnector.class))
                        .exchange()
                        .flatMap(clientResponse ->
                                        clientResponse.bodyToMono(Connector.class)
                                .zipWith(Mono.just(clientResponse.headers().header("Location").get(0)))
                        )
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

    public Mono<Map<String, Object>> getConnectorConfig(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/config")
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                        })
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    // todo 201
    public Mono<Connector> setConnectorConfig(String clusterName, String connectorName, Mono<Object> requestBody) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/config")
                        .body(BodyInserters.fromPublisher(requestBody, Object.class))
                        .retrieve()
                        .bodyToMono(Connector.class)
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

    public Flux<ConnectorTask> getConnectorTasks(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/tasks")
                        .retrieve()
                        .bodyToFlux(ConnectorTask.class)
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<TaskStatus> getConnectorTaskStatus(String clusterName, String connectorName, Integer taskId) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/tasks/" + taskId + "/status")
                        .retrieve()
                        .bodyToMono(TaskStatus.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> restartConnectorTask(String clusterName, String connectorName, Integer taskId) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/" + connectorName + "/tasks/" + taskId + "/restart")
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Flux<ConnectorPlugin>> getConnectorPlugins(String clusterName) {
        return Mono.just(clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connector-plugins")
                        .retrieve()
                        .bodyToFlux(ConnectorPlugin.class)
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster"))));
    }

    public Mono<ConnectorPluginConfigValidationResponse> validateConnectorPluginConfig(String clusterName, String pluginName, Mono<Object> requestBody) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connector-plugins/" + pluginName + "/config/validate")
                        .body(BodyInserters.fromPublisher(requestBody, Object.class))
                        .retrieve()
                        .bodyToMono(ConnectorPluginConfigValidationResponse.class)
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }
}
