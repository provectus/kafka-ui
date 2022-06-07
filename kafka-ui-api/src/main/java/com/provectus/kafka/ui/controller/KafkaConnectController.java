package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.KafkaConnectApi;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorActionDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.util.Map;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class KafkaConnectController extends AbstractController implements KafkaConnectApi {
  private final KafkaConnectService kafkaConnectService;

  @Override
  public Mono<ResponseEntity<Flux<ConnectDTO>>> getConnects(String clusterName,
                                                            ServerWebExchange exchange) {
    return kafkaConnectService.getConnects(getCluster(clusterName)).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<String>>> getConnectors(String clusterName, String connectName,
                                                          ServerWebExchange exchange) {
    var connectors = kafkaConnectService.getConnectors(getCluster(clusterName), connectName);
    return Mono.just(ResponseEntity.ok(connectors));
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> createConnector(String clusterName, String connectName,
                                                            @Valid Mono<NewConnectorDTO> connector,
                                                            ServerWebExchange exchange) {
    return kafkaConnectService.createConnector(getCluster(clusterName), connectName, connector)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> getConnector(String clusterName, String connectName,
                                                         String connectorName,
                                                         ServerWebExchange exchange) {
    return kafkaConnectService.getConnector(getCluster(clusterName), connectName, connectorName)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteConnector(String clusterName, String connectName,
                                                    String connectorName,
                                                    ServerWebExchange exchange) {
    return kafkaConnectService.deleteConnector(getCluster(clusterName), connectName, connectorName)
        .map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<FullConnectorInfoDTO>>> getAllConnectors(
      String clusterName,
      String search,
      ServerWebExchange exchange
  ) {
    return Mono.just(ResponseEntity.ok(
        kafkaConnectService.getAllConnectors(getCluster(clusterName), search)));
  }

  @Override
  public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfig(String clusterName,
                                                                      String connectName,
                                                                      String connectorName,
                                                                      ServerWebExchange exchange) {
    return kafkaConnectService
        .getConnectorConfig(getCluster(clusterName), connectName, connectorName)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> setConnectorConfig(String clusterName,
                                                               String connectName,
                                                               String connectorName,
                                                               @Valid Mono<Object> requestBody,
                                                               ServerWebExchange exchange) {
    return kafkaConnectService
        .setConnectorConfig(getCluster(clusterName), connectName, connectorName, requestBody)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> updateConnectorState(String clusterName, String connectName,
                                                         String connectorName,
                                                         ConnectorActionDTO action,
                                                         ServerWebExchange exchange) {
    return kafkaConnectService
        .updateConnectorState(getCluster(clusterName), connectName, connectorName, action)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<TaskDTO>>> getConnectorTasks(String clusterName,
                                                               String connectName,
                                                               String connectorName,
                                                               ServerWebExchange exchange) {
    return Mono.just(ResponseEntity
        .ok(kafkaConnectService
            .getConnectorTasks(getCluster(clusterName), connectName, connectorName)));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartConnectorTask(String clusterName, String connectName,
                                                         String connectorName, Integer taskId,
                                                         ServerWebExchange exchange) {
    return kafkaConnectService
        .restartConnectorTask(getCluster(clusterName), connectName, connectorName, taskId)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<ConnectorPluginDTO>>> getConnectorPlugins(
      String clusterName, String connectName, ServerWebExchange exchange) {
    return kafkaConnectService
        .getConnectorPlugins(getCluster(clusterName), connectName)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ConnectorPluginConfigValidationResponseDTO>>
      validateConnectorPluginConfig(
      String clusterName, String connectName, String pluginName, @Valid Mono<Object> requestBody,
      ServerWebExchange exchange) {
    return kafkaConnectService
        .validateConnectorPluginConfig(
            getCluster(clusterName), connectName, pluginName, requestBody)
        .map(ResponseEntity::ok);
  }
}
