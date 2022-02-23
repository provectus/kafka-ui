package com.provectus.kafka.ui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.client.KafkaConnectClients;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.connect.model.ConnectorStatus;
import com.provectus.kafka.ui.connect.model.ConnectorStatusConnector;
import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.connect.model.TaskStatus;
import com.provectus.kafka.ui.exception.ConnectNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.mapper.KafkaConnectMapper;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorActionDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.ConnectorStateDTO;
import com.provectus.kafka.ui.model.ConnectorTaskStatusDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.connect.InternalConnectInfo;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConnectService {
  private final ClusterMapper clusterMapper;
  private final KafkaConnectMapper kafkaConnectMapper;
  private final ObjectMapper objectMapper;
  private final KafkaConfigSanitizer kafkaConfigSanitizer;

  public Mono<Flux<ConnectDTO>> getConnects(KafkaCluster cluster) {
    return Mono.just(
        Flux.fromIterable(
            cluster.getKafkaConnect().stream()
                .map(clusterMapper::toKafkaConnect)
                .collect(Collectors.toList())
        )
    );
  }

  public Flux<FullConnectorInfoDTO> getAllConnectors(final KafkaCluster cluster,
                                                     final String search) {
    return getConnects(cluster)
        .flatMapMany(Function.identity())
        .flatMap(connect -> getConnectorNames(cluster, connect.getName()))
        .flatMap(pair -> getConnector(cluster, pair.getT1(), pair.getT2()))
        .flatMap(connector ->
            getConnectorConfig(cluster, connector.getConnect(), connector.getName())
                .map(config -> InternalConnectInfo.builder()
                    .connector(connector)
                    .config(config)
                    .build()
                )
        )
        .flatMap(connectInfo -> {
          ConnectorDTO connector = connectInfo.getConnector();
          return getConnectorTasks(cluster, connector.getConnect(), connector.getName())
              .collectList()
              .map(tasks -> InternalConnectInfo.builder()
                  .connector(connector)
                  .config(connectInfo.getConfig())
                  .tasks(tasks)
                  .build()
              );
        })
        .flatMap(connectInfo -> {
          ConnectorDTO connector = connectInfo.getConnector();
          return getConnectorTopics(cluster, connector.getConnect(), connector.getName())
              .map(ct -> InternalConnectInfo.builder()
                  .connector(connector)
                  .config(connectInfo.getConfig())
                  .tasks(connectInfo.getTasks())
                  .topics(ct.getTopics())
                  .build()
              );
        })
        .map(kafkaConnectMapper::fullConnectorInfoFromTuple)
        .filter(matchesSearchTerm(search));
  }

  private Predicate<FullConnectorInfoDTO> matchesSearchTerm(final String search) {
    return connector -> getSearchValues(connector)
        .anyMatch(value -> value.contains(
            StringUtils.defaultString(
                    search,
                    StringUtils.EMPTY)
                .toUpperCase()));
  }

  private Stream<String> getSearchValues(FullConnectorInfoDTO fullConnectorInfo) {
    return Stream.of(
            fullConnectorInfo.getName(),
            fullConnectorInfo.getStatus().getState().getValue(),
            fullConnectorInfo.getType().getValue())
        .map(String::toUpperCase);
  }

  private Mono<ConnectorTopics> getConnectorTopics(KafkaCluster cluster, String connectClusterName,
                                                   String connectorName) {
    return withConnectClient(cluster, connectClusterName)
        .flatMap(c -> c.getConnectorTopics(connectorName).map(result -> result.get(connectorName)))
        // old connectors don't have this api, setting empty list for
        // backward-compatibility
        .onErrorResume(Exception.class, e -> Mono.just(new ConnectorTopics().topics(List.of())));
  }

  private Flux<Tuple2<String, String>> getConnectorNames(KafkaCluster cluster, String connectName) {
    return getConnectors(cluster, connectName)
        .collectList().map(e -> e.get(0))
        // for some reason `getConnectors` method returns the response as a single string
        .map(this::parseToList)
        .flatMapMany(Flux::fromIterable)
        .map(connector -> Tuples.of(connectName, connector));
  }

  @SneakyThrows
  private List<String> parseToList(String json) {
    return objectMapper.readValue(json, new TypeReference<>() {
    });
  }

  public Flux<String> getConnectors(KafkaCluster cluster, String connectName) {
    return withConnectClient(cluster, connectName)
        .flatMapMany(client ->
            client.getConnectors(null)
                .doOnError(e -> log.error("Unexpected error upon getting connectors", e))
        );
  }

  public Mono<ConnectorDTO> createConnector(KafkaCluster cluster, String connectName,
                                            Mono<NewConnectorDTO> connector) {
    return withConnectClient(cluster, connectName)
        .flatMap(client ->
            connector
                .flatMap(c -> connectorExists(cluster, connectName, c.getName())
                    .map(exists -> {
                      if (Boolean.TRUE.equals(exists)) {
                        throw new ValidationException(
                            String.format("Connector with name %s already exists", c.getName()));
                      }
                      return c;
                    }))
                .map(kafkaConnectMapper::toClient)
                .flatMap(client::createConnector)
                .flatMap(c -> getConnector(cluster, connectName, c.getName()))
        );
  }

  private Mono<Boolean> connectorExists(KafkaCluster cluster, String connectName,
                                        String connectorName) {
    return getConnectorNames(cluster, connectName)
        .map(Tuple2::getT2)
        .collectList()
        .map(connectorNames -> connectorNames.contains(connectorName));
  }

  public Mono<ConnectorDTO> getConnector(KafkaCluster cluster, String connectName,
                                         String connectorName) {
    return withConnectClient(cluster, connectName)
        .flatMap(client -> client.getConnector(connectorName)
            .map(kafkaConnectMapper::fromClient)
            .flatMap(connector ->
                client.getConnectorStatus(connector.getName())
                    // status request can return 404 if tasks not assigned yet
                    .onErrorResume(WebClientResponseException.NotFound.class,
                        e -> emptyStatus(connectorName))
                    .map(connectorStatus -> {
                      var status = connectorStatus.getConnector();
                      final Map<String, Object> obfuscatedConfig = connector.getConfig().entrySet()
                          .stream()
                          .collect(Collectors.toMap(
                              Map.Entry::getKey,
                              e -> kafkaConfigSanitizer.sanitize(e.getKey(), e.getValue())
                          ));
                      ConnectorDTO result = (ConnectorDTO) new ConnectorDTO()
                          .connect(connectName)
                          .status(kafkaConnectMapper.fromClient(status))
                          .type(connector.getType())
                          .tasks(connector.getTasks())
                          .name(connector.getName())
                          .config(obfuscatedConfig);

                      if (connectorStatus.getTasks() != null) {
                        boolean isAnyTaskFailed = connectorStatus.getTasks().stream()
                            .map(TaskStatus::getState)
                            .anyMatch(TaskStatus.StateEnum.FAILED::equals);

                        if (isAnyTaskFailed) {
                          result.getStatus().state(ConnectorStateDTO.TASK_FAILED);
                        }
                      }
                      return result;
                    })
            )
        );
  }

  private Mono<ConnectorStatus> emptyStatus(String connectorName) {
    return Mono.just(new ConnectorStatus()
        .name(connectorName)
        .tasks(List.of())
        .connector(new ConnectorStatusConnector()
            .state(ConnectorStatusConnector.StateEnum.UNASSIGNED)));
  }

  public Mono<Map<String, Object>> getConnectorConfig(KafkaCluster cluster, String connectName,
                                                      String connectorName) {
    return withConnectClient(cluster, connectName)
        .flatMap(c -> c.getConnectorConfig(connectorName))
        .map(connectorConfig -> {
          final Map<String, Object> obfuscatedMap = new HashMap<>();
          connectorConfig.forEach((key, value) ->
              obfuscatedMap.put(key, kafkaConfigSanitizer.sanitize(key, value)));
          return obfuscatedMap;
        });
  }

  public Mono<ConnectorDTO> setConnectorConfig(KafkaCluster cluster, String connectName,
                                               String connectorName, Mono<Object> requestBody) {
    return withConnectClient(cluster, connectName)
        .flatMap(c ->
            requestBody
                .flatMap(body -> c.setConnectorConfig(connectorName, (Map<String, Object>) body))
                .map(kafkaConnectMapper::fromClient));
  }

  public Mono<Void> deleteConnector(
      KafkaCluster cluster, String connectName, String connectorName) {
    return withConnectClient(cluster, connectName)
        .flatMap(c -> c.deleteConnector(connectorName));
  }

  public Mono<Void> updateConnectorState(KafkaCluster cluster, String connectName,
                                         String connectorName, ConnectorActionDTO action) {
    return withConnectClient(cluster, connectName)
        .flatMap(client -> {
          switch (action) {
            case RESTART:
              return client.restartConnector(connectorName, false, false);
            case RESTART_ALL_TASKS:
              return restartTasks(cluster, connectName, connectorName, task -> true);
            case RESTART_FAILED_TASKS:
              return restartTasks(cluster, connectName, connectorName,
                  t -> t.getStatus().getState() == ConnectorTaskStatusDTO.FAILED);
            case PAUSE:
              return client.pauseConnector(connectorName);
            case RESUME:
              return client.resumeConnector(connectorName);
            default:
              throw new IllegalStateException("Unexpected value: " + action);
          }
        });
  }

  private Mono<Void> restartTasks(KafkaCluster cluster, String connectName,
                                  String connectorName, Predicate<TaskDTO> taskFilter) {
    return getConnectorTasks(cluster, connectName, connectorName)
        .filter(taskFilter)
        .flatMap(t ->
            restartConnectorTask(cluster, connectName, connectorName, t.getId().getTask()))
        .then();
  }

  public Flux<TaskDTO> getConnectorTasks(KafkaCluster cluster, String connectName, String connectorName) {
    return withConnectClient(cluster, connectName)
        .flatMapMany(client ->
            client.getConnectorTasks(connectorName)
                .onErrorResume(WebClientResponseException.NotFound.class, e -> Flux.empty())
                .map(kafkaConnectMapper::fromClient)
                .flatMap(task ->
                    client
                        .getConnectorTaskStatus(connectorName, task.getId().getTask())
                        .onErrorResume(WebClientResponseException.NotFound.class, e -> Mono.empty())
                        .map(kafkaConnectMapper::fromClient)
                        .map(task::status)
                ));
  }

  public Mono<Void> restartConnectorTask(KafkaCluster cluster, String connectName,
                                         String connectorName, Integer taskId) {
    return withConnectClient(cluster, connectName)
        .flatMap(client -> client.restartConnectorTask(connectorName, taskId));
  }

  public Mono<Flux<ConnectorPluginDTO>> getConnectorPlugins(KafkaCluster cluster,
                                                            String connectName) {
    return withConnectClient(cluster, connectName)
        .map(client -> client.getConnectorPlugins().map(kafkaConnectMapper::fromClient));
  }

  public Mono<ConnectorPluginConfigValidationResponseDTO> validateConnectorPluginConfig(
      KafkaCluster cluster, String connectName, String pluginName, Mono<Object> requestBody) {
    return withConnectClient(cluster, connectName)
        .flatMap(client ->
            requestBody
                .flatMap(body ->
                    client.validateConnectorPluginConfig(pluginName, (Map<String, Object>) body))
                .map(kafkaConnectMapper::fromClient)
        );
  }

  private Mono<KafkaConnectClientApi> withConnectClient(KafkaCluster cluster, String connectName) {
    return Mono.justOrEmpty(cluster.getKafkaConnect().stream()
            .filter(connect -> connect.getName().equals(connectName))
            .findFirst()
            .map(KafkaConnectCluster::getAddress))
        .switchIfEmpty(Mono.error(ConnectNotFoundException::new))
        .map(KafkaConnectClients::withBaseUrl);
  }
}
