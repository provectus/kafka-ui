package com.provectus.kafka.ui.client;

import com.provectus.kafka.ui.connect.ApiClient;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.connect.model.Connector;
import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.exception.KafkaConnectConflictReponseException;
import com.provectus.kafka.ui.exception.ValidationException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Slf4j
public class RetryingKafkaConnectClient extends KafkaConnectClientApi {
  private static final int MAX_RETRIES = 5;
  private static final Duration RETRIES_DELAY = Duration.ofMillis(200);

  public RetryingKafkaConnectClient(String basePath) {
    super(new RetryingApiClient().setBasePath(basePath));
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

  private static class RetryingApiClient extends ApiClient {
    @Override
    public <T> Mono<T> invokeAPI(String path, HttpMethod method, Map<String, Object> pathParams,
                                 MultiValueMap<String, String> queryParams, Object body,
                                 HttpHeaders headerParams,
                                 MultiValueMap<String, String> cookieParams,
                                 MultiValueMap<String, Object> formParams, List<MediaType> accept,
                                 MediaType contentType, String[] authNames,
                                 ParameterizedTypeReference<T> returnType)
        throws RestClientException {
      return withRetryOnConflict(
          super.invokeAPI(path, method, pathParams, queryParams, body, headerParams, cookieParams,
              formParams, accept, contentType, authNames, returnType)
      );
    }

    @Override
    public <T> Flux<T> invokeFluxAPI(String path, HttpMethod method, Map<String, Object> pathParams,
                                     MultiValueMap<String, String> queryParams, Object body,
                                     HttpHeaders headerParams,
                                     MultiValueMap<String, String> cookieParams,
                                     MultiValueMap<String, Object> formParams,
                                     List<MediaType> accept, MediaType contentType,
                                     String[] authNames, ParameterizedTypeReference<T> returnType)
        throws RestClientException {
      return withRetryOnConflict(
          super.invokeFluxAPI(path, method, pathParams, queryParams, body, headerParams,
              cookieParams, formParams, accept, contentType, authNames, returnType)
      );
    }
  }
}
