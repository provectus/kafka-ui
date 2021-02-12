package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ApiClustersConnectorsApi;
import com.provectus.kafka.ui.cluster.service.KafkaConnectService;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
public class KafkaConnectRestController implements ApiClustersConnectorsApi {
    private final KafkaConnectService kafkaConnectService;

    @Override
    public Mono<ResponseEntity<Flux<String>>> getConnectors(String clusterName, ServerWebExchange exchange) {
        Flux<String> connectors = kafkaConnectService.getConnectors(clusterName);
        return Mono.just(ResponseEntity.ok(connectors));
    }

    @Override
    public Mono<ResponseEntity<Connector>> createConnector(String clusterName, @Valid Mono<NewConnector> connector, ServerWebExchange exchange) {
        return kafkaConnectService.createConnector(clusterName, connector)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Connector>> getConnector(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnector(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteConnector(String clusterName, String connectorName, ServerWebExchange exchange) {
        // todo return 409
        return kafkaConnectService.deleteConnector(clusterName, connectorName)
                .map(v -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfig(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorConfig(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Connector>> setConnectorConfig(String clusterName, String connectorName, @Valid Mono<Object> requestBody, ServerWebExchange exchange) {
        return kafkaConnectService.setConnectorConfig(clusterName, connectorName, requestBody)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ConnectorStatus>> getConnectorStatus(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorStatus(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> restartConnector(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.restartConnector(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> pauseConnector(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.pauseConnector(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> resumeConnector(String clusterName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.resumeConnector(clusterName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<ConnectorTask>>> getConnectorTasks(String clusterName, String connectorName, ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(kafkaConnectService.getConnectorTasks(clusterName, connectorName)));
    }

    @Override
    public Mono<ResponseEntity<TaskStatus>> getConnectorTaskStatus(String clusterName, String connectorName, Integer taskId, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorTaskStatus(clusterName, connectorName, taskId)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> restartConnectorTask(String clusterName, String connectorName, Integer taskId, ServerWebExchange exchange) {
        return kafkaConnectService.restartConnectorTask(clusterName, connectorName, taskId)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<ConnectorPlugin>>> getConnectorPlugins(String clusterName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorPlugins(clusterName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ConnectorPluginConfigValidationResponse>> validateConnectorPluginConfig(String clusterName, String pluginName, @Valid Mono<Object> requestBody, ServerWebExchange exchange) {
        return kafkaConnectService.validateConnectorPluginConfig(clusterName, pluginName, requestBody)
                .map(ResponseEntity::ok);
    }
}
