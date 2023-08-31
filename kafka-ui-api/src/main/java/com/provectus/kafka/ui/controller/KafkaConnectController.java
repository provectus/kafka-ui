package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.ConnectorActionDTO.RESTART;
import static com.provectus.kafka.ui.model.ConnectorActionDTO.RESTART_ALL_TASKS;
import static com.provectus.kafka.ui.model.ConnectorActionDTO.RESTART_FAILED_TASKS;

import com.provectus.kafka.ui.api.KafkaConnectApi;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorActionDTO;
import com.provectus.kafka.ui.model.ConnectorColumnsToSortDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
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
  private static final Set<ConnectorActionDTO> RESTART_ACTIONS
      = Set.of(RESTART, RESTART_FAILED_TASKS, RESTART_ALL_TASKS);
  private static final String CONNECTOR_NAME = "connectorName";

  private final KafkaConnectService kafkaConnectService;

  @Override
  public Mono<ResponseEntity<Flux<ConnectDTO>>> getConnects(String clusterName,
                                                            ServerWebExchange exchange) {

    Flux<ConnectDTO> availableConnects = kafkaConnectService.getConnects(getCluster(clusterName))
        .filterWhen(dto -> accessControlService.isConnectAccessible(dto, clusterName));

    return Mono.just(ResponseEntity.ok(availableConnects));
  }

  @Override
  public Mono<ResponseEntity<Flux<String>>> getConnectors(String clusterName, String connectName,
                                                          ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .operationName("getConnectors")
        .build();

    return validateAccess(context)
        .thenReturn(ResponseEntity.ok(kafkaConnectService.getConnectorNames(getCluster(clusterName), connectName)))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> createConnector(String clusterName, String connectName,
                                                            @Valid Mono<NewConnectorDTO> connector,
                                                            ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW, ConnectAction.CREATE)
        .operationName("createConnector")
        .build();

    return validateAccess(context).then(
        kafkaConnectService.createConnector(getCluster(clusterName), connectName, connector)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> getConnector(String clusterName, String connectName,
                                                         String connectorName,
                                                         ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connector(connectorName)
        .operationName("getConnector")
        .build();

    return validateAccess(context).then(
        kafkaConnectService.getConnector(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteConnector(String clusterName, String connectName,
                                                    String connectorName,
                                                    ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW, ConnectAction.EDIT)
        .operationName("deleteConnector")
        .operationParams(Map.of(CONNECTOR_NAME, connectName))
        .build();

    return validateAccess(context).then(
        kafkaConnectService.deleteConnector(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }


  @Override
  public Mono<ResponseEntity<Flux<FullConnectorInfoDTO>>> getAllConnectors(
      String clusterName,
      String search,
      ConnectorColumnsToSortDTO orderBy,
      SortOrderDTO sortOrder,
      ServerWebExchange exchange
  ) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .connectActions(ConnectAction.VIEW, ConnectAction.EDIT)
        .operationName("getAllConnectors")
        .build();

    var comparator = sortOrder == null || sortOrder.equals(SortOrderDTO.ASC)
        ? getConnectorsComparator(orderBy)
        : getConnectorsComparator(orderBy).reversed();

    Flux<FullConnectorInfoDTO> job = kafkaConnectService.getAllConnectors(getCluster(clusterName), search)
        .filterWhen(dto -> accessControlService.isConnectAccessible(dto.getConnect(), clusterName))
        .filterWhen(dto -> accessControlService.isConnectorAccessible(dto.getConnect(), dto.getName(), clusterName))
        .sort(comparator);

    return Mono.just(ResponseEntity.ok(job))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfig(String clusterName,
                                                                      String connectName,
                                                                      String connectorName,
                                                                      ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .operationName("getConnectorConfig")
        .build();

    return validateAccess(context).then(
        kafkaConnectService
            .getConnectorConfig(getCluster(clusterName), connectName, connectorName)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ConnectorDTO>> setConnectorConfig(String clusterName, String connectName,
                                                               String connectorName,
                                                               Mono<Map<String, Object>> requestBody,
                                                               ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW, ConnectAction.EDIT)
        .operationName("setConnectorConfig")
        .operationParams(Map.of(CONNECTOR_NAME, connectorName))
        .build();

    return validateAccess(context).then(
            kafkaConnectService
                .setConnectorConfig(getCluster(clusterName), connectName, connectorName, requestBody)
                .map(ResponseEntity::ok))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateConnectorState(String clusterName, String connectName,
                                                         String connectorName,
                                                         ConnectorActionDTO action,
                                                         ServerWebExchange exchange) {
    ConnectAction[] connectActions;
    if (RESTART_ACTIONS.contains(action)) {
      connectActions = new ConnectAction[] {ConnectAction.VIEW, ConnectAction.RESTART};
    } else {
      connectActions = new ConnectAction[] {ConnectAction.VIEW, ConnectAction.EDIT};
    }

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(connectActions)
        .operationName("updateConnectorState")
        .operationParams(Map.of(CONNECTOR_NAME, connectorName))
        .build();

    return validateAccess(context).then(
        kafkaConnectService
            .updateConnectorState(getCluster(clusterName), connectName, connectorName, action)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<TaskDTO>>> getConnectorTasks(String clusterName,
                                                               String connectName,
                                                               String connectorName,
                                                               ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .operationName("getConnectorTasks")
        .operationParams(Map.of(CONNECTOR_NAME, connectorName))
        .build();

    return validateAccess(context).thenReturn(
        ResponseEntity
            .ok(kafkaConnectService
                .getConnectorTasks(getCluster(clusterName), connectName, connectorName))
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartConnectorTask(String clusterName, String connectName,
                                                         String connectorName, Integer taskId,
                                                         ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW, ConnectAction.RESTART)
        .operationName("restartConnectorTask")
        .operationParams(Map.of(CONNECTOR_NAME, connectorName))
        .build();

    return validateAccess(context).then(
        kafkaConnectService
            .restartConnectorTask(getCluster(clusterName), connectName, connectorName, taskId)
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<ConnectorPluginDTO>>> getConnectorPlugins(
      String clusterName, String connectName, ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .operationName("getConnectorPlugins")
        .build();

    return validateAccess(context).then(
        Mono.just(
            ResponseEntity.ok(
                kafkaConnectService.getConnectorPlugins(getCluster(clusterName), connectName)))
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ConnectorPluginConfigValidationResponseDTO>> validateConnectorPluginConfig(
      String clusterName, String connectName, String pluginName, @Valid Mono<Map<String, Object>> requestBody,
      ServerWebExchange exchange) {
    return kafkaConnectService
        .validateConnectorPluginConfig(
            getCluster(clusterName), connectName, pluginName, requestBody)
        .map(ResponseEntity::ok);
  }

  private Comparator<FullConnectorInfoDTO> getConnectorsComparator(ConnectorColumnsToSortDTO orderBy) {
    var defaultComparator = Comparator.comparing(FullConnectorInfoDTO::getName);
    if (orderBy == null) {
      return defaultComparator;
    }
    return switch (orderBy) {
      case CONNECT -> Comparator.comparing(FullConnectorInfoDTO::getConnect);
      case TYPE -> Comparator.comparing(FullConnectorInfoDTO::getType);
      case STATUS -> Comparator.comparing(fullConnectorInfoDTO -> fullConnectorInfoDTO.getStatus().getState());
      default -> defaultComparator;
    };
  }
}
