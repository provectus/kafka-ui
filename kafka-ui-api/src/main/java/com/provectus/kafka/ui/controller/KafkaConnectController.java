package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ClusterAction.VIEW;

import com.provectus.kafka.ui.api.KafkaConnectApi;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorActionDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectorAction;
import com.provectus.kafka.ui.service.KafkaConnectService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Flux<ConnectDTO>>> getConnects(String clusterName,
                                                            ServerWebExchange exchange) {

    Flux<ConnectDTO> flux = Flux.fromIterable(kafkaConnectService.getConnects(getCluster(clusterName)))
        .filterWhen(accessControlService::isConnectAccessible);

    return Mono.just(ResponseEntity.ok(flux));
  }

  @Override
  public Mono<ResponseEntity<Flux<String>>> getConnectors(String clusterName, String connectName,
                                                          ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.VIEW)
        .build());

    return validateAccess.then(
        Mono.just(ResponseEntity.ok(kafkaConnectService.getConnectors(getCluster(clusterName), connectName)))
    );
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> createConnector(String clusterName, String connectName,
                                                            @Valid Mono<NewConnectorDTO> connector,
                                                            ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.CREATE)
        .build());

    return validateAccess.then(
        kafkaConnectService.createConnector(getCluster(clusterName), connectName, connector)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> getConnector(String clusterName, String connectName,
                                                         String connectorName,
                                                         ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connector(connectorName)
        .connectorActions(ConnectorAction.VIEW)
        .build());

    return validateAccess.then(
        kafkaConnectService.getConnector(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteConnector(String clusterName, String connectName,
                                                    String connectorName,
                                                    ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.DELETE)
        .build());

    return validateAccess.then(
        kafkaConnectService.deleteConnector(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    );
  }


  @Override
  public Mono<ResponseEntity<Flux<FullConnectorInfoDTO>>> getAllConnectors(
      String clusterName,
      String search,
      ServerWebExchange exchange
  ) {

    Flux<FullConnectorInfoDTO> job = kafkaConnectService.getAllConnectors(getCluster(clusterName), search)
        .filterWhen(dto -> accessControlService.isConnectAccessible(dto.getConnect()))
        .filterWhen(dto -> accessControlService.isConnectorAccessible(dto.getConnect(), dto.getName()));

    return Mono.just(ResponseEntity.ok(job));
  }

  @Override
  public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfig(String clusterName,
                                                                      String connectName,
                                                                      String connectorName,
                                                                      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.CONFIG_VIEW)
        .build());

    return validateAccess.then(
        kafkaConnectService
            .getConnectorConfig(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> setConnectorConfig(String clusterName,
                                                               String connectName,
                                                               String connectorName,
                                                               @Valid Mono<Object> requestBody,
                                                               ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.EDIT)
        .build());

    return validateAccess.then(
        kafkaConnectService
            .setConnectorConfig(getCluster(clusterName), connectName, connectorName, requestBody)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> updateConnectorState(String clusterName, String connectName,
                                                         String connectorName,
                                                         ConnectorActionDTO action,
                                                         ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.RESTART)
        .build());

    return validateAccess.then(
        kafkaConnectService
            .updateConnectorState(getCluster(clusterName), connectName, connectorName, action)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<TaskDTO>>> getConnectorTasks(String clusterName,
                                                               String connectName,
                                                               String connectorName,
                                                               ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.TASKS_VIEW)
        .build());

    return validateAccess.then(
        Mono.just(ResponseEntity
            .ok(kafkaConnectService
                .getConnectorTasks(getCluster(clusterName), connectName, connectorName)))
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> restartConnectorTask(String clusterName, String connectName,
                                                         String connectorName, Integer taskId,
                                                         ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.TASKS_ALTER)
        .build());

    return validateAccess.then(
        kafkaConnectService
            .restartConnectorTask(getCluster(clusterName), connectName, connectorName, taskId)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<ConnectorPluginDTO>>> getConnectorPlugins(
      String clusterName, String connectName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connectorActions(ConnectorAction.VIEW)
        .build());

    return validateAccess.then(
        kafkaConnectService
            .getConnectorPlugins(getCluster(clusterName), connectName)
            .map(ResponseEntity::ok)
    );
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
