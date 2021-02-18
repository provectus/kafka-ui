package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.client.KafkaConnectClient;
import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.mapper.KafkaConnectMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.KafkaConnectCluster;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.retry.Retry;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
    private static final int MAX_RETRIES = 5;

    private final ClustersStorage clustersStorage;
    private final ClusterMapper clusterMapper;
    private final KafkaConnectMapper kafkaConnectMapper;


    public Flux<String> getConnectors(String clusterName, String connectName) {
        return getConnectAddress(clusterName, connectName)
                .flatMapMany(connect -> withRetryOnConflict(
                        KafkaConnectClient.createClient(connect).getConnectors()
                        ).doOnError(log::error)
                );
    }

    public Mono<Connector> createConnector(String clusterName, String connectName, Mono<NewConnector> connector) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect -> withRetryOnConflict(
                        connector.cache()
                                .map(kafkaConnectMapper::toClientNewConnector)
                                .flatMap(c -> KafkaConnectClient.createClient(connect).createConnector(c))
                                .map(kafkaConnectMapper::fromClientConnector)
                        ).doOnError(log::error)
                );
    }

    public Mono<Connector> getConnector(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect -> withRetryOnConflict(
                        KafkaConnectClient.createClient(connect).getConnector(connectorName)
                                .map(kafkaConnectMapper::fromClientConnector)
                        ).doOnError(log::error)
                );
    }

    public Mono<Map<String, Object>> getConnectorConfig(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).getConnectorConfig(connectorName)
                        ).doOnError(log::error)
                );
    }

    public Mono<Connector> setConnectorConfig(String clusterName, String connectName, String connectorName, Mono<Object> requestBody) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        requestBody.flatMap(body ->
                                withRetryOnConflict(
                                        KafkaConnectClient.createClient(connect).setConnectorConfig(connectorName, (Map<String, Object>) body)
                                ))
                                .map(kafkaConnectMapper::fromClientConnector)
                                .doOnError(log::error)
                );
    }

    public Mono<Void> deleteConnector(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).deleteConnector(connectorName)
                        ).doOnError(log::error)
                );
    }

    public Mono<Void> restartConnector(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).restartConnector(connectorName)
                        ).doOnError(log::error)
                );
    }

    public Mono<Void> pauseConnector(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).pauseConnector(connectorName)
                        ).doOnError(log::error)
                );
    }

    public Mono<Void> resumeConnector(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).resumeConnector(connectorName)
                        ).doOnError(log::error)
                );
    }

    public Flux<ConnectorTask> getConnectorTasks(String clusterName, String connectName, String connectorName) {
        return getConnectAddress(clusterName, connectName)
                .flatMapMany(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).getConnectorTasks(connectorName)
                        )
                                .map(kafkaConnectMapper::fromClientConnectorTask)
                                .doOnError(log::error)
                );
    }

    public Mono<Void> restartConnectorTask(String clusterName, String connectName, String connectorName, Integer taskId) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).restartConnectorTask(connectorName, taskId)
                        ).doOnError(log::error)
                );
    }

    public Mono<Flux<ConnectorPlugin>> getConnectorPlugins(String clusterName, String connectName) {
        return Mono.just(getConnectAddress(clusterName, connectName)
                .flatMapMany(connect ->
                        withRetryOnConflict(
                                KafkaConnectClient.createClient(connect).getConnectorPlugins()
                        )
                                .map(kafkaConnectMapper::fromClientConnectorPlugin)
                                .doOnError(log::error)
                ));
    }

    public Mono<ConnectorPluginConfigValidationResponse> validateConnectorPluginConfig(String clusterName, String connectName, String pluginName, Mono<Object> requestBody) {
        return getConnectAddress(clusterName, connectName)
                .flatMap(connect ->
                        requestBody.flatMap(body ->
                                withRetryOnConflict(
                                        KafkaConnectClient.createClient(connect).validateConnectorPluginConfig(pluginName, (Map<String, Object>) body)
                                ))
                                .map(kafkaConnectMapper::fromClient)
                                .doOnError(log::error)
                );
    }

    public Mono<Flux<Connect>> getConnects(String clusterName) {
        return Mono.just(
                Flux.fromIterable(clustersStorage.getClusterByName(clusterName)
                        .map(KafkaCluster::getKafkaConnect).stream()
                        .flatMap(Collection::stream)
                        .map(clusterMapper::toKafkaConnect)
                        .collect(Collectors.toList())
                )
        );
    }

    private Mono<KafkaCluster> getCluster(String clusterName) {
        return clustersStorage.getClusterByName(clusterName)
                .map(Mono::just)
                .orElse(Mono.error(new NotFoundException("No such cluster")));
    }

    private Mono<String> getConnectAddress(String clusterName, String connectName) {
        return getCluster(clusterName)
                .map(kafkaCluster ->
                        kafkaCluster.getKafkaConnect().stream()
                                .filter(connect -> connect.getName().equals(connectName))
                                .findFirst()
                                .map(KafkaConnectCluster::getAddress)
                )
                .filter(Optional::isPresent)
                .map(Optional::get);
    }

    private  <T> Mono<T> withRetryOnConflict(Mono<T> publisher) {
        return publisher.retryWhen(
                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                        .retryMax(MAX_RETRIES)
        );
    }

    private  <T> Flux<T> withRetryOnConflict(Flux<T> publisher) {
        return publisher.retryWhen(
                Retry.onlyIf(e -> e.exception() instanceof WebClientResponseException.Conflict)
                        .retryMax(MAX_RETRIES)
        );
    }
}
