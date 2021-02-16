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
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.retry.Retry;

import java.util.Map;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
    private static final int MAX_RETRIES = 5;

    private final ClustersStorage clustersStorage;
    private final WebClient webClient;

    public Flux<String> getConnectors(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors")
                        .retrieve()
                        .bodyToFlux(new ParameterizedTypeReference<String>() {
                        })
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error)
                )
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<Connector> createConnector(String clusterName, Mono<NewConnector> connector) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors")
                        .body(BodyInserters.fromPublisher(connector, NewConnector.class))
                        .retrieve()
                        .bodyToMono(Connector.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Connector> getConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}", connectorName)
                        .retrieve()
                        .bodyToMono(Connector.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Map<String, Object>> getConnectorConfig(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/config", connectorName)
                        .retrieve()
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                        })
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Connector> setConnectorConfig(String clusterName, String connectorName, Mono<Object> requestBody) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/config", connectorName)
                        .body(BodyInserters.fromPublisher(requestBody, Object.class))
                        .retrieve()
                        .bodyToMono(Connector.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> deleteConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.delete()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}", connectorName)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<ConnectorStatus> getConnectorStatus(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/status", connectorName)
                        .retrieve()
                        .bodyToMono(ConnectorStatus.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> restartConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/restart", connectorName)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> pauseConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/pause", connectorName)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> resumeConnector(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.put()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/resume", connectorName)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Flux<ConnectorTask> getConnectorTasks(String clusterName, String connectorName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/tasks", connectorName)
                        .retrieve()
                        .bodyToFlux(ConnectorTask.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Flux.error(new NotFoundException("No such cluster")));
    }

    public Mono<TaskStatus> getConnectorTaskStatus(String clusterName, String connectorName, Integer taskId) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/tasks/{taskId}/status", connectorName, taskId)
                        .retrieve()
                        .bodyToMono(TaskStatus.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Void> restartConnectorTask(String clusterName, String connectorName, Integer taskId) {
        return clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.post()
                        .uri(cluster.getKafkaConnect() + "/connectors/{connectorName}/tasks/{taskId}/restart", connectorName, taskId)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    public Mono<Flux<ConnectorPlugin>> getConnectorPlugins(String clusterName) {
        return Mono.just(clustersStorage.getClusterByName(clusterName)
                .map(cluster -> webClient.get()
                        .uri(cluster.getKafkaConnect() + "/connector-plugins")
                        .retrieve()
                        .bodyToFlux(ConnectorPlugin.class)
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
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
                        .retryWhen(
                                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                                        .retryMax(MAX_RETRIES))
                        .doOnError(log::error))
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }
}
