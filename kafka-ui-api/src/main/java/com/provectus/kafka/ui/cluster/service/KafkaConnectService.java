package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.client.KafkaConnectClient;
import com.provectus.kafka.ui.cluster.exception.ValidationException;
import com.provectus.kafka.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
    private final KafkaConnectClient kafkaConnectClient;


    public Flux<String> getConnectors(String clusterName) {
        return kafkaConnectClient.getConnectors(clusterName)
                .flatMapMany(Flux::just);
    }

    public Mono<Connector> createConnector(String clusterName, Mono<NewConnector> connector) {
        var connectorWithName = connector.map(c -> {
            c.getConfig().putIfAbsent("name", c.getName());
            return c;
        }).cache();
        return connectorWithName.flatMap(c -> {
                    var connectorClass = c.getConfig().get("connector.class").toString().split("\\.");
                    var pluginName = connectorClass[connectorClass.length - 1];
                    return validateConnectorPluginConfig(clusterName, pluginName, connectorWithName.map(NewConnector::getConfig));
                }
        ).flatMap(response -> response.getErrorCount() > 0
                ? Mono.error(new ValidationException("Connector config is not valid"))
                : kafkaConnectClient.createConnector(clusterName, connectorWithName)
        );
    }

    public Mono<Connector> getConnector(String clusterName, String connectorName) {
        return kafkaConnectClient.getConnector(clusterName, connectorName);
    }

    public Mono<Map<String, Object>> getConnectorConfig(String clusterName, String connectorName) {
        return kafkaConnectClient.getConnectorConfig(clusterName, connectorName);
    }

    public Mono<Connector> setConnectorConfig(String clusterName, String connectorName, Mono<Object> requestBody) {
        return requestBody
                .map(body -> (Map<String, Object>) body)
                .map(config -> {
                    config.putIfAbsent("name", connectorName);
                    var connectorClass = config.get("connector.class").toString().split("\\.");
                    return connectorClass[connectorClass.length - 1];
                })
                .flatMap(pluginName -> validateConnectorPluginConfig(clusterName, pluginName, requestBody)
                        .flatMap(response ->
                                response.getErrorCount() > 0
                                        ? Mono.error(new ValidationException("Connector config is not valid"))
                                        : kafkaConnectClient.setConnectorConfig(clusterName, connectorName, requestBody)
                        )
                );
    }

    public Mono<Void> deleteConnector(String clusterName, String connectorName) {
        return kafkaConnectClient.deleteConnector(clusterName, connectorName);
    }

    public Mono<ConnectorStatus> getConnectorStatus(String clusterName, String connectorName) {
        return kafkaConnectClient.getConnectorStatus(clusterName, connectorName);
    }

    public Mono<Void> restartConnector(String clusterName, String connectorName) {
        return kafkaConnectClient.restartConnector(clusterName, connectorName);
    }

    public Mono<Void> pauseConnector(String clusterName, String connectorName) {
        return kafkaConnectClient.pauseConnector(clusterName, connectorName);
    }

    public Mono<Void> resumeConnector(String clusterName, String connectorName) {
        return kafkaConnectClient.resumeConnector(clusterName, connectorName);
    }

    public Flux<ConnectorTask> getConnectorTasks(String clusterName, String connectorName) {
        return kafkaConnectClient.getConnectorTasks(clusterName, connectorName);
    }

    public Mono<TaskStatus> getConnectorTaskStatus(String clusterName, String connectorName, Integer taskId) {
        return kafkaConnectClient.getConnectorTaskStatus(clusterName, connectorName, taskId);
    }

    public Mono<Void> restartConnectorTask(String clusterName, String connectorName, Integer taskId) {
        return kafkaConnectClient.restartConnectorTask(clusterName, connectorName, taskId);
    }

    public Mono<Flux<ConnectorPlugin>> getConnectorPlugins(String clusterName) {
        return kafkaConnectClient.getConnectorPlugins(clusterName);
    }

    public Mono<ConnectorPluginConfigValidationResponse> validateConnectorPluginConfig(String clusterName, String pluginName, Mono<Object> requestBody) {
        return kafkaConnectClient.validateConnectorPluginConfig(clusterName, pluginName, requestBody);
    }
}
