package com.provectus.kafka.ui.client;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.provectus.kafka.ui.connect.ApiClient;
import com.provectus.kafka.ui.connect.RFC3339DateFormat;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.connect.model.Connector;
import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.exception.KafkaConnectConflictReponseException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import com.provectus.kafka.ui.util.SecuredWebClient;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.text.DateFormat;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.util.MultiValueMap;
import org.springframework.util.ResourceUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.client.RestClientException;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

@Slf4j
public class RetryingKafkaConnectClient extends KafkaConnectClientApi {
  private static final int MAX_RETRIES = 5;
  private static final Duration RETRIES_DELAY = Duration.ofMillis(200);

  public RetryingKafkaConnectClient(KafkaConnectCluster config, DataSize maxBuffSize) {
    super(new RetryingApiClient(config, maxBuffSize));
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

    private static final DateFormat dateFormat = getDefaultDateFormat();
    private static final ObjectMapper mapper = buildObjectMapper(dateFormat);

    public RetryingApiClient(KafkaConnectCluster config, DataSize maxBuffSize) {
      super(buildWebClient(mapper, maxBuffSize, config), mapper, dateFormat);
      setBasePath(config.getAddress());
      setUsername(config.getUserName());
      setPassword(config.getPassword());
    }

    public static DateFormat getDefaultDateFormat() {
      DateFormat dateFormat = new RFC3339DateFormat();
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      return dateFormat;
    }

    public static WebClient buildWebClient(ObjectMapper mapper, DataSize maxBuffSize, KafkaConnectCluster config) {
      ExchangeStrategies strategies = ExchangeStrategies
              .builder()
              .codecs(clientDefaultCodecsConfigurer -> {
                clientDefaultCodecsConfigurer.defaultCodecs()
                        .jackson2JsonEncoder(new Jackson2JsonEncoder(mapper, MediaType.APPLICATION_JSON));
                clientDefaultCodecsConfigurer.defaultCodecs()
                        .jackson2JsonDecoder(new Jackson2JsonDecoder(mapper, MediaType.APPLICATION_JSON));
                clientDefaultCodecsConfigurer.defaultCodecs()
                        .maxInMemorySize((int) maxBuffSize.toBytes());
              })
              .build();

      try {
        WebClient.Builder webClient = SecuredWebClient.configure(
            config.getKeystoreLocation(),
            config.getKeystorePassword(),
            config.getTruststoreLocation(),
            config.getTruststorePassword()
        );

        return webClient.exchangeStrategies(strategies).build();
      } catch (Exception e) {
        throw new IllegalStateException(
            "cannot create TLS configuration for kafka-connect cluster " + config.getName(), e);
      }
    }

    public static ObjectMapper buildObjectMapper(DateFormat dateFormat) {
      ObjectMapper mapper = new ObjectMapper();
      mapper.setDateFormat(dateFormat);
      mapper.registerModule(new JavaTimeModule());
      mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
      JsonNullableModule jnm = new JsonNullableModule();
      mapper.registerModule(jnm);
      return mapper;
    }

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
