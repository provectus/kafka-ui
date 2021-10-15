package com.provectus.kafka.ui.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.client.KafkaConnectClients;
import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.connect.model.TaskStatus;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.ConnectNotFoundException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.mapper.KafkaConnectMapper;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorActionDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.ConnectorStateDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import com.provectus.kafka.ui.model.NewConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.connect.InternalConnectInfo;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Service
@Log4j2
@RequiredArgsConstructor
public class KafkaConnectService {
  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final KafkaConnectMapper kafkaConnectMapper;
  private final ObjectMapper objectMapper;

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
        .flatMap(connect -> getConnectorNames(cluster, connect))
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
    return (connector) -> getSearchValues(connector)
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
    return getConnectAddress(cluster, connectClusterName)
        .flatMap(connectUrl -> KafkaConnectClients
            .withBaseUrl(connectUrl)
            .getConnectorTopics(connectorName)
            .map(result -> result.get(connectorName))
        );
  }

  private Flux<Tuple2<String, String>> getConnectorNames(KafkaCluster cluster, ConnectDTO connect) {
    return getConnectors(cluster, connect.getName())
        .collectList().map(e -> e.get(0))
        // for some reason `getConnectors` method returns the response as a single string
        .map(this::parseToList)
        .flatMapMany(Flux::fromIterable)
        .map(connector -> Tuples.of(connect.getName(), connector));
  }

  @SneakyThrows
  private List<String> parseToList(String json) {
    return objectMapper.readValue(json, new TypeReference<>() {
    });
  }

  public Flux<String> getConnectors(KafkaCluster cluster, String connectName) {
    return getConnectAddress(cluster, connectName)
        .flatMapMany(connect ->
            KafkaConnectClients.withBaseUrl(connect).getConnectors(null)
                .doOnError(log::error)
        );
  }

  public Mono<ConnectorDTO> createConnector(KafkaCluster cluster, String connectName,
                                         Mono<NewConnectorDTO> connector) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            connector
                .map(kafkaConnectMapper::toClient)
                .flatMap(c ->
                    KafkaConnectClients.withBaseUrl(connect).createConnector(c)
                )
                .flatMap(c -> getConnector(cluster, connectName, c.getName()))
        );
  }

  public Mono<ConnectorDTO> getConnector(KafkaCluster cluster, String connectName,
                                      String connectorName) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect -> KafkaConnectClients.withBaseUrl(connect).getConnector(connectorName)
            .map(kafkaConnectMapper::fromClient)
            .flatMap(connector ->
                KafkaConnectClients.withBaseUrl(connect).getConnectorStatus(connector.getName())
                    .map(connectorStatus -> {
                      var status = connectorStatus.getConnector();
                      ConnectorDTO result = (ConnectorDTO) new ConnectorDTO()
                          .connect(connectName)
                          .status(kafkaConnectMapper.fromClient(status))
                          .type(connector.getType())
                          .tasks(connector.getTasks())
                          .name(connector.getName())
                          .config(connector.getConfig());

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

  public Mono<Map<String, Object>> getConnectorConfig(KafkaCluster cluster, String connectName,
                                                      String connectorName) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            KafkaConnectClients.withBaseUrl(connect).getConnectorConfig(connectorName)
        );
  }

  public Mono<ConnectorDTO> setConnectorConfig(KafkaCluster cluster, String connectName,
                                            String connectorName, Mono<Object> requestBody) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            requestBody.flatMap(body ->
                KafkaConnectClients.withBaseUrl(connect)
                    .setConnectorConfig(connectorName, (Map<String, Object>) body)
            )
                .map(kafkaConnectMapper::fromClient)
        );
  }

  public Mono<Void> deleteConnector(
      KafkaCluster cluster, String connectName, String connectorName) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            KafkaConnectClients.withBaseUrl(connect).deleteConnector(connectorName)
        );
  }

  public Mono<Void> updateConnectorState(KafkaCluster cluster, String connectName,
                                         String connectorName, ConnectorActionDTO action) {
    Function<String, Mono<Void>> kafkaClientCall;
    switch (action) {
      case RESTART:
        kafkaClientCall =
            connect -> KafkaConnectClients.withBaseUrl(connect).restartConnector(connectorName);
        break;
      case PAUSE:
        kafkaClientCall =
            connect -> KafkaConnectClients.withBaseUrl(connect).pauseConnector(connectorName);
        break;
      case RESUME:
        kafkaClientCall =
            connect -> KafkaConnectClients.withBaseUrl(connect).resumeConnector(connectorName);
        break;
      default:
        throw new IllegalStateException("Unexpected value: " + action);
    }
    return getConnectAddress(cluster, connectName)
        .flatMap(kafkaClientCall);
  }

  public Flux<TaskDTO> getConnectorTasks(KafkaCluster cluster, String connectName,
                                      String connectorName) {
    return getConnectAddress(cluster, connectName)
        .flatMapMany(connect ->
            KafkaConnectClients.withBaseUrl(connect).getConnectorTasks(connectorName)
                .map(kafkaConnectMapper::fromClient)
                .flatMap(task ->
                    KafkaConnectClients.withBaseUrl(connect)
                        .getConnectorTaskStatus(connectorName, task.getId().getTask())
                        .map(kafkaConnectMapper::fromClient)
                        .map(task::status)
                )
        );
  }

  public Mono<Void> restartConnectorTask(KafkaCluster cluster, String connectName,
                                         String connectorName, Integer taskId) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            KafkaConnectClients.withBaseUrl(connect).restartConnectorTask(connectorName, taskId)
        );
  }

  public Mono<Flux<ConnectorPluginDTO>> getConnectorPlugins(KafkaCluster cluster,
                                                            String connectName) {
    return Mono.just(getConnectAddress(cluster, connectName)
        .flatMapMany(connect ->
            KafkaConnectClients.withBaseUrl(connect).getConnectorPlugins()
                .map(kafkaConnectMapper::fromClient)
        ));
  }

  public Mono<ConnectorPluginConfigValidationResponseDTO> validateConnectorPluginConfig(
      KafkaCluster cluster, String connectName, String pluginName, Mono<Object> requestBody) {
    return getConnectAddress(cluster, connectName)
        .flatMap(connect ->
            requestBody.flatMap(body ->
                KafkaConnectClients.withBaseUrl(connect)
                    .validateConnectorPluginConfig(pluginName, (Map<String, Object>) body)
            )
                .map(kafkaConnectMapper::fromClient)
        );
  }

  private Mono<KafkaCluster> getCluster(String clusterName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(Mono::just)
        .orElse(Mono.error(ClusterNotFoundException::new));
  }

  private Mono<String> getConnectAddress(KafkaCluster cluster, String connectName) {
    return Mono.justOrEmpty(cluster.getKafkaConnect().stream()
            .filter(connect -> connect.getName().equals(connectName))
            .findFirst()
            .map(KafkaConnectCluster::getAddress))
        .switchIfEmpty(Mono.error(ConnectNotFoundException::new));
  }
}
