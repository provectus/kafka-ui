package com.provectus.kafka.ui.rest;

import com.provectus.kafka.ui.api.ApiClustersConnectApi;
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
public class KafkaConnectRestController implements ApiClustersConnectApi {
    private final KafkaConnectService kafkaConnectService;

    @Override
    public Mono<ResponseEntity<Flux<Connect>>> getConnects(String clusterName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnects(clusterName).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<String>>> getConnectors(String clusterName, String connectName, ServerWebExchange exchange) {
        Flux<String> connectors = kafkaConnectService.getConnectors(clusterName, connectName);
        return Mono.just(ResponseEntity.ok(connectors));
    }

    @Override
    public Mono<ResponseEntity<Connector>> createConnector(String clusterName, String connectName, @Valid Mono<NewConnector> connector, ServerWebExchange exchange) {
        return kafkaConnectService.createConnector(clusterName, connectName, connector)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Connector>> getConnector(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnector(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteConnector(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.deleteConnector(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfig(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorConfig(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Connector>> setConnectorConfig(String clusterName, String connectName, String connectorName, @Valid Mono<Object> requestBody, ServerWebExchange exchange) {
        return kafkaConnectService.setConnectorConfig(clusterName, connectName, connectorName, requestBody)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> restartConnector(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.restartConnector(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> pauseConnector(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.pauseConnector(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> resumeConnector(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return kafkaConnectService.resumeConnector(clusterName, connectName, connectorName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<ConnectorTask>>> getConnectorTasks(String clusterName, String connectName, String connectorName, ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(kafkaConnectService.getConnectorTasks(clusterName, connectName, connectorName)));
    }

    @Override
    public Mono<ResponseEntity<Void>> restartConnectorTask(String clusterName, String connectName, String connectorName, Integer taskId, ServerWebExchange exchange) {
        return kafkaConnectService.restartConnectorTask(clusterName, connectName, connectorName, taskId)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<ConnectorPlugin>>> getConnectorPlugins(String clusterName, String connectName, ServerWebExchange exchange) {
        return kafkaConnectService.getConnectorPlugins(clusterName, connectName)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ConnectorPluginConfigValidationResponse>> validateConnectorPluginConfig(String clusterName, String connectName, String pluginName, @Valid Mono<Object> requestBody, ServerWebExchange exchange) {
        return kafkaConnectService.validateConnectorPluginConfig(clusterName, connectName, pluginName, requestBody)
                .map(ResponseEntity::ok);
    }
}
