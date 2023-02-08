package com.provectus.kafka.ui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.connect.model.ConnectorStatus;
import com.provectus.kafka.ui.connect.model.ConnectorStatusConnector;
import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.connect.model.TaskStatus;
import com.provectus.kafka.ui.exception.NotFoundException;
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
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.connect.InternalConnectInfo;
import com.provectus.kafka.ui.util.ReactiveFailover;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConnectService {
  private final ClusterMapper clusterMapper;
  private final KafkaConnectMapper kafkaConnectMapper;
  private final ObjectMapper objectMapper;
  private final KafkaConfigSanitizer kafkaConfigSanitizer;

  public Flux<ConnectDTO> getConnects(KafkaCluster cluster) {
    return Flux.fromIterable(
        Optional.ofNullable(cluster.getOriginalProperties().getKafkaConnect())
            .map(lst -> lst.stream().map(clusterMapper::toKafkaConnect).toList())
            .orElse(List.of())
    );
  }

  public Flux<FullConnectorInfoDTO> getAllConnectors(final KafkaCluster cluster,
                                                     @Nullable final String search) {
    return getConnects(cluster)
        .flatMap(connect -> getConnectorNames(cluster, connect.getName()).map(cn -> Tuples.of(connect.getName(), cn)))
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

  private Predicate<FullConnectorInfoDTO> matchesSearchTerm(@Nullable final String search) {
    if (search == null) {
      return c -> true;
    }
    return connector -> getStringsForSearch(connector)
        .anyMatch(string -> StringUtils.containsIgnoreCase(string, search));
  }

  private Stream<String> getStringsForSearch(FullConnectorInfoDTO fullConnectorInfo) {
    return Stream.of(
        fullConnectorInfo.getName(),
        fullConnectorInfo.getStatus().getState().getValue(),
        fullConnectorInfo.getType().getValue());
  }

  public Mono<ConnectorTopics> getConnectorTopics(KafkaCluster cluster, String connectClusterName,
                                                  String connectorName) {
    return api(cluster, connectClusterName)
        .mono(c -> c.getConnectorTopics(connectorName))
        .map(result -> result.get(connectorName))
        // old Connect API versions don't have this endpoint, setting empty list for
        // backward-compatibility
        .onErrorResume(Exception.class, e -> Mono.just(new ConnectorTopics().topics(List.of())));
  }

  public Flux<String> getConnectorNames(KafkaCluster cluster, String connectName) {
    return api(cluster, connectName)
        .flux(client -> client.getConnectors(null))
        // for some reason `getConnectors` method returns the response as a single string
        .collectList().map(e -> e.get(0))
        .map(this::parseConnectorsNamesStringToList)
        .flatMapMany(Flux::fromIterable);
  }

  @SneakyThrows
  private List<String> parseConnectorsNamesStringToList(String json) {
    return objectMapper.readValue(json, new TypeReference<>() {
    });
  }

  public Mono<ConnectorDTO> createConnector(KafkaCluster cluster, String connectName,
                                            Mono<NewConnectorDTO> connector) {
    return api(cluster, connectName)
        .mono(client ->
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
        .any(name -> name.equals(connectorName));
  }

  public Mono<ConnectorDTO> getConnector(KafkaCluster cluster, String connectName,
                                         String connectorName) {
    return api(cluster, connectName)
        .mono(client -> client.getConnector(connectorName)
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
    return api(cluster, connectName)
        .mono(c -> c.getConnectorConfig(connectorName))
        .map(connectorConfig -> {
          final Map<String, Object> obfuscatedMap = new HashMap<>();
          connectorConfig.forEach((key, value) ->
              obfuscatedMap.put(key, kafkaConfigSanitizer.sanitize(key, value)));
          return obfuscatedMap;
        });
  }

  public Mono<ConnectorDTO> setConnectorConfig(KafkaCluster cluster, String connectName,
                                               String connectorName, Mono<Object> requestBody) {
    return api(cluster, connectName)
        .mono(c ->
            requestBody
                .flatMap(body -> c.setConnectorConfig(connectorName, (Map<String, Object>) body))
                .map(kafkaConnectMapper::fromClient));
  }

  public Mono<Void> deleteConnector(
      KafkaCluster cluster, String connectName, String connectorName) {
    return api(cluster, connectName)
        .mono(c -> c.deleteConnector(connectorName));
  }

  public Mono<Void> updateConnectorState(KafkaCluster cluster, String connectName,
                                         String connectorName, ConnectorActionDTO action) {
    return api(cluster, connectName)
        .mono(client -> {
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
    return api(cluster, connectName)
        .flux(client ->
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
    return api(cluster, connectName)
        .mono(client -> client.restartConnectorTask(connectorName, taskId));
  }

  public Flux<ConnectorPluginDTO> getConnectorPlugins(KafkaCluster cluster,
                                                      String connectName) {
    return api(cluster, connectName)
        .flux(client -> client.getConnectorPlugins().map(kafkaConnectMapper::fromClient));
  }

  public Mono<ConnectorPluginConfigValidationResponseDTO> validateConnectorPluginConfig(
      KafkaCluster cluster, String connectName, String pluginName, Mono<Object> requestBody) {
    return api(cluster, connectName)
        .mono(client ->
            requestBody
                .flatMap(body ->
                    client.validateConnectorPluginConfig(pluginName, (Map<String, Object>) body))
                .map(kafkaConnectMapper::fromClient)
        );
  }

  private ReactiveFailover<KafkaConnectClientApi> api(KafkaCluster cluster, String connectName) {
    var client = cluster.getConnectsClients().get(connectName);
    if (client == null) {
      throw new NotFoundException(
          "Connect %s not found for cluster %s".formatted(connectName, cluster.getName()));
    }
    return client;
  }
}
