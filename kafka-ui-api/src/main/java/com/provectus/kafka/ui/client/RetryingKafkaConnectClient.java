package com.provectus.kafka.ui.client;

import static com.provectus.kafka.ui.config.ClustersProperties.ConnectCluster;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.connect.ApiClient;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.connect.model.Connector;
import com.provectus.kafka.ui.connect.model.ConnectorPlugin;
import com.provectus.kafka.ui.connect.model.ConnectorPluginConfigValidationResponse;
import com.provectus.kafka.ui.connect.model.ConnectorStatus;
import com.provectus.kafka.ui.connect.model.ConnectorTask;
import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.connect.model.TaskStatus;
import com.provectus.kafka.ui.exception.KafkaConnectConflictReponseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestClientException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Slf4j
public class RetryingKafkaConnectClient extends KafkaConnectClientApi {
  private static final int MAX_RETRIES = 5;
  private static final Duration RETRIES_DELAY = Duration.ofMillis(200);

  public RetryingKafkaConnectClient(ConnectCluster config,
                                    @Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                    DataSize maxBuffSize) {
    super(new RetryingApiClient(config, truststoreConfig, maxBuffSize));
  }

  private static Retry conflictCodeRetry() {
    return Retry
        .fixedDelay(MAX_RETRIES, RETRIES_DELAY)
        .filter(e -> e instanceof WebClientResponseException.Conflict)
        .onRetryExhaustedThrow((spec, signal) ->
            new KafkaConnectConflictReponseException(
                (WebClientResponseException.Conflict) signal.failure()));
  }

  private static <T> Mono<T> withRetryOnConflict(Mono<T> publisher) {
    return publisher.retryWhen(conflictCodeRetry());
  }

  private static <T> Flux<T> withRetryOnConflict(Flux<T> publisher) {
    return publisher.retryWhen(conflictCodeRetry());
  }

  private static <T> Mono<T> withBadRequestErrorHandling(Mono<T> publisher) {
    return publisher
        .onErrorResume(WebClientResponseException.BadRequest.class, e ->
            Mono.error(new ValidationException("Invalid configuration")))
        .onErrorResume(WebClientResponseException.InternalServerError.class, e ->
            Mono.error(new ValidationException("Invalid configuration")));
  }

  @Override
  public Mono<Connector> createConnector(NewConnector newConnector) throws RestClientException {
    return withBadRequestErrorHandling(
        super.createConnector(newConnector)
    );
  }

  @Override
  public Mono<Connector> setConnectorConfig(String connectorName, Map<String, Object> requestBody)
      throws RestClientException {
    return withBadRequestErrorHandling(
        super.setConnectorConfig(connectorName, requestBody)
    );
  }

  @Override
  public Mono<ResponseEntity<Connector>> createConnectorWithHttpInfo(NewConnector newConnector)
      throws WebClientResponseException {
    return withRetryOnConflict(super.createConnectorWithHttpInfo(newConnector));
  }

  @Override
  public Mono<Void> deleteConnector(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.deleteConnector(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteConnectorWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.deleteConnectorWithHttpInfo(connectorName));
  }


  @Override
  public Mono<Connector> getConnector(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnector(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Connector>> getConnectorWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorWithHttpInfo(connectorName));
  }

  @Override
  public Mono<Map<String, Object>> getConnectorConfig(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorConfig(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Map<String, Object>>> getConnectorConfigWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorConfigWithHttpInfo(connectorName));
  }

  @Override
  public Flux<ConnectorPlugin> getConnectorPlugins() throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorPlugins());
  }

  @Override
  public Mono<ResponseEntity<List<ConnectorPlugin>>> getConnectorPluginsWithHttpInfo()
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorPluginsWithHttpInfo());
  }

  @Override
  public Mono<ConnectorStatus> getConnectorStatus(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorStatus(connectorName));
  }

  @Override
  public Mono<ResponseEntity<ConnectorStatus>> getConnectorStatusWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorStatusWithHttpInfo(connectorName));
  }

  @Override
  public Mono<TaskStatus> getConnectorTaskStatus(String connectorName, Integer taskId)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTaskStatus(connectorName, taskId));
  }

  @Override
  public Mono<ResponseEntity<TaskStatus>> getConnectorTaskStatusWithHttpInfo(String connectorName, Integer taskId)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTaskStatusWithHttpInfo(connectorName, taskId));
  }

  @Override
  public Flux<ConnectorTask> getConnectorTasks(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTasks(connectorName));
  }

  @Override
  public Mono<ResponseEntity<List<ConnectorTask>>> getConnectorTasksWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTasksWithHttpInfo(connectorName));
  }

  @Override
  public Mono<Map<String, ConnectorTopics>> getConnectorTopics(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTopics(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Map<String, ConnectorTopics>>> getConnectorTopicsWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorTopicsWithHttpInfo(connectorName));
  }

  @Override
  public Flux<String> getConnectors(String search) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectors(search));
  }

  @Override
  public Mono<ResponseEntity<List<String>>> getConnectorsWithHttpInfo(String search) throws WebClientResponseException {
    return withRetryOnConflict(super.getConnectorsWithHttpInfo(search));
  }

  @Override
  public Mono<Void> pauseConnector(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.pauseConnector(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Void>> pauseConnectorWithHttpInfo(String connectorName) throws WebClientResponseException {
    return withRetryOnConflict(super.pauseConnectorWithHttpInfo(connectorName));
  }

  @Override
  public Mono<Void> restartConnector(String connectorName, Boolean includeTasks, Boolean onlyFailed)
      throws WebClientResponseException {
    return withRetryOnConflict(super.restartConnector(connectorName, includeTasks, onlyFailed));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartConnectorWithHttpInfo(String connectorName, Boolean includeTasks,
                                                                 Boolean onlyFailed) throws WebClientResponseException {
    return withRetryOnConflict(super.restartConnectorWithHttpInfo(connectorName, includeTasks, onlyFailed));
  }

  @Override
  public Mono<Void> restartConnectorTask(String connectorName, Integer taskId) throws WebClientResponseException {
    return withRetryOnConflict(super.restartConnectorTask(connectorName, taskId));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartConnectorTaskWithHttpInfo(String connectorName, Integer taskId)
      throws WebClientResponseException {
    return withRetryOnConflict(super.restartConnectorTaskWithHttpInfo(connectorName, taskId));
  }

  @Override
  public Mono<Void> resumeConnector(String connectorName) throws WebClientResponseException {
    return super.resumeConnector(connectorName);
  }

  @Override
  public Mono<ResponseEntity<Void>> resumeConnectorWithHttpInfo(String connectorName)
      throws WebClientResponseException {
    return withRetryOnConflict(super.resumeConnectorWithHttpInfo(connectorName));
  }

  @Override
  public Mono<ResponseEntity<Connector>> setConnectorConfigWithHttpInfo(String connectorName,
                                                                        Map<String, Object> requestBody)
      throws WebClientResponseException {
    return withRetryOnConflict(super.setConnectorConfigWithHttpInfo(connectorName, requestBody));
  }

  @Override
  public Mono<ConnectorPluginConfigValidationResponse> validateConnectorPluginConfig(String pluginName,
                                                                                     Map<String, Object> requestBody)
      throws WebClientResponseException {
    return withRetryOnConflict(super.validateConnectorPluginConfig(pluginName, requestBody));
  }

  @Override
  public Mono<ResponseEntity<ConnectorPluginConfigValidationResponse>> validateConnectorPluginConfigWithHttpInfo(
      String pluginName, Map<String, Object> requestBody) throws WebClientResponseException {
    return withRetryOnConflict(super.validateConnectorPluginConfigWithHttpInfo(pluginName, requestBody));
  }

  private static class RetryingApiClient extends ApiClient {

    public RetryingApiClient(ConnectCluster config,
                             ClustersProperties.TruststoreConfig truststoreConfig,
                             DataSize maxBuffSize) {
      super(buildWebClient(maxBuffSize, config, truststoreConfig), null, null);
      setBasePath(config.getAddress());
      setUsername(config.getUsername());
      setPassword(config.getPassword());
    }

    public static WebClient buildWebClient(DataSize maxBuffSize,
                                           ConnectCluster config,
                                           ClustersProperties.TruststoreConfig truststoreConfig) {
      return new WebClientConfigurator()
          .configureSsl(
              truststoreConfig,
              new ClustersProperties.KeystoreConfig(
                  config.getKeystoreLocation(),
                  config.getKeystorePassword()
              )
          )
          .configureBasicAuth(
              config.getUsername(),
              config.getPassword()
          )
          .configureBufferSize(maxBuffSize)
          .build();
    }
  }
}
