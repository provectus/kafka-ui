package com.provectus.kafka.ui.service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import com.provectus.kafka.ui.exception.SchemaCompatibilityException;
import com.provectus.kafka.ui.exception.SchemaFailedToDeleteException;
import com.provectus.kafka.ui.exception.SchemaNotFoundException;
import com.provectus.kafka.ui.exception.SchemaTypeNotSupportedException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.NewSchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaTypeDTO;
import com.provectus.kafka.ui.model.schemaregistry.ErrorResponse;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityLevel;
import com.provectus.kafka.ui.model.schemaregistry.InternalNewSchema;
import com.provectus.kafka.ui.model.schemaregistry.SubjectIdResponse;
import com.provectus.kafka.ui.util.SecuredWebClient;
import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.Formatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchemaRegistryService {

  public static final String NO_SUCH_SCHEMA_VERSION = "No such schema %s with version %s";
  public static final String NO_SUCH_SCHEMA = "No such schema %s";

  private static final String URL_SUBJECTS = "/subjects";
  private static final String URL_SUBJECT = "/subjects/{schemaName}";
  private static final String URL_SUBJECT_VERSIONS = "/subjects/{schemaName}/versions";
  private static final String URL_SUBJECT_BY_VERSION = "/subjects/{schemaName}/versions/{version}";
  private static final String LATEST = "latest";

  private static final String UNRECOGNIZED_FIELD_SCHEMA_TYPE = "Unrecognized field: schemaType";
  private static final String INCOMPATIBLE_WITH_AN_EARLIER_SCHEMA = "incompatible with an earlier schema";
  private static final String INVALID_SCHEMA = "Invalid Schema";

  public Mono<List<SchemaSubjectDTO>> getAllLatestVersionSchemas(KafkaCluster cluster,
                                                                 List<String> subjects) {
    return Flux.fromIterable(subjects)
        .concatMap(subject -> getLatestSchemaVersionBySubject(cluster, subject))
        .collect(Collectors.toList());
  }

  public Mono<String[]> getAllSubjectNames(KafkaCluster cluster) {
    return configuredWebClient(
        cluster,
        HttpMethod.GET,
        URL_SUBJECTS)
        .retrieve()
        .bodyToMono(String[].class)
        .doOnError(e -> log.error("Unexpected error", e))
        .as(m -> failoverAble(m,
            new FailoverMono<>(cluster.getSchemaRegistry(), () -> this.getAllSubjectNames(cluster))));
  }

  public Flux<SchemaSubjectDTO> getAllVersionsBySubject(KafkaCluster cluster, String subject) {
    Flux<Integer> versions = getSubjectVersions(cluster, subject);
    return versions.flatMap(version -> getSchemaSubjectByVersion(cluster, subject, version));
  }

  private Flux<Integer> getSubjectVersions(KafkaCluster cluster, String schemaName) {
    return configuredWebClient(
        cluster,
        HttpMethod.GET,
        URL_SUBJECT_VERSIONS,
        schemaName)
        .retrieve()
        .onStatus(NOT_FOUND::equals,
            throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName)))
        .bodyToFlux(Integer.class)
        .as(f -> failoverAble(f, new FailoverFlux<>(cluster.getSchemaRegistry(),
            () -> this.getSubjectVersions(cluster, schemaName))));
  }

  public Mono<SchemaSubjectDTO> getSchemaSubjectByVersion(KafkaCluster cluster, String schemaName,
                                                          Integer version) {
    return this.getSchemaSubject(cluster, schemaName, String.valueOf(version));
  }

  public Mono<SchemaSubjectDTO> getLatestSchemaVersionBySubject(KafkaCluster cluster,
                                                                String schemaName) {
    return this.getSchemaSubject(cluster, schemaName, LATEST);
  }

  private Mono<SchemaSubjectDTO> getSchemaSubject(KafkaCluster cluster, String schemaName,
                                                  String version) {
    return configuredWebClient(
        cluster,
        HttpMethod.GET,
        SchemaRegistryService.URL_SUBJECT_BY_VERSION,
        List.of(schemaName, version))
        .retrieve()
        .onStatus(NOT_FOUND::equals,
            throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA_VERSION, schemaName, version))
        )
        .bodyToMono(SchemaSubjectDTO.class)
        .map(this::withSchemaType)
        .zipWith(getSchemaCompatibilityInfoOrGlobal(cluster, schemaName))
        .map(tuple -> {
          SchemaSubjectDTO schema = tuple.getT1();
          String compatibilityLevel = tuple.getT2().getCompatibilityLevel();
          schema.setCompatibilityLevel(compatibilityLevel);
          return schema;
        })
        .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
            () -> this.getSchemaSubject(cluster, schemaName, version))));
  }

  /**
   * If {@link SchemaSubjectDTO#getSchemaType()} is null, then AVRO, otherwise,
   * adds the schema type as is.
   */
  @NotNull
  private SchemaSubjectDTO withSchemaType(SchemaSubjectDTO s) {
    return s.schemaType(Optional.ofNullable(s.getSchemaType()).orElse(SchemaTypeDTO.AVRO));
  }

  public Mono<Void> deleteSchemaSubjectByVersion(KafkaCluster cluster,
                                                 String schemaName,
                                                 Integer version) {
    return this.deleteSchemaSubject(cluster, schemaName, String.valueOf(version));
  }

  public Mono<Void> deleteLatestSchemaSubject(KafkaCluster cluster,
                                              String schemaName) {
    return this.deleteSchemaSubject(cluster, schemaName, LATEST);
  }

  private Mono<Void> deleteSchemaSubject(KafkaCluster cluster, String schemaName,
                                         String version) {
    return configuredWebClient(
        cluster,
        HttpMethod.DELETE,
        SchemaRegistryService.URL_SUBJECT_BY_VERSION,
        List.of(schemaName, version))
        .retrieve()
        .onStatus(NOT_FOUND::equals,
            throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA_VERSION, schemaName, version))
        )
        .toBodilessEntity()
        .then()
        .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
            () -> this.deleteSchemaSubject(cluster, schemaName, version))));
  }

  public Mono<Void> deleteSchemaSubjectEntirely(KafkaCluster cluster,
                                                String schemaName) {
    return configuredWebClient(
        cluster,
        HttpMethod.DELETE,
        URL_SUBJECT,
        schemaName)
        .retrieve()
        .onStatus(HttpStatus::isError, errorOnSchemaDeleteFailure(schemaName))
        .toBodilessEntity()
        .then()
        .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
            () -> this.deleteSchemaSubjectEntirely(cluster, schemaName))));
  }

  /**
   * Checks whether the provided schema duplicates the previous or not, creates a new schema
   * and then returns the whole content by requesting its latest version.
   */
  public Mono<SchemaSubjectDTO> registerNewSchema(KafkaCluster cluster,
                                                  Mono<NewSchemaSubjectDTO> newSchemaSubject) {
    return newSchemaSubject
        .flatMap(schema -> {
          SchemaTypeDTO schemaType =
              SchemaTypeDTO.AVRO == schema.getSchemaType() ? null : schema.getSchemaType();
          Mono<InternalNewSchema> newSchema =
              Mono.just(new InternalNewSchema(schema.getSchema(), schemaType));
          String subject = schema.getSubject();
          return submitNewSchema(subject, newSchema, cluster)
              .flatMap(resp -> getLatestSchemaVersionBySubject(cluster, subject));
        });
  }

  @NotNull
  private Mono<SubjectIdResponse> submitNewSchema(String subject,
                                                  Mono<InternalNewSchema> newSchemaSubject,
                                                  KafkaCluster cluster) {
    return configuredWebClient(
        cluster,
        HttpMethod.POST,
        URL_SUBJECT_VERSIONS, subject)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromPublisher(newSchemaSubject, InternalNewSchema.class))
        .retrieve()
        .onStatus(status -> UNPROCESSABLE_ENTITY.equals(status) || CONFLICT.equals(status),
            r -> r.bodyToMono(ErrorResponse.class)
                .flatMap(this::getMonoError))
        .bodyToMono(SubjectIdResponse.class)
        .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
            () -> submitNewSchema(subject, newSchemaSubject, cluster))));
  }

  @NotNull
  private Mono<Throwable> getMonoError(ErrorResponse x) {
    if (isUnrecognizedFieldSchemaTypeMessage(x.getMessage())) {
      return Mono.error(new SchemaTypeNotSupportedException());
    } else if (isIncompatibleSchemaMessage(x.getMessage())) {
      return Mono.error(new SchemaCompatibilityException(x.getMessage()));
    } else {
      log.error(x.getMessage());
      return Mono.error(new UnprocessableEntityException(INVALID_SCHEMA));
    }
  }

  @NotNull
  private Function<ClientResponse, Mono<? extends Throwable>> throwIfNotFoundStatus(
      String formatted) {
    return resp -> Mono.error(new SchemaNotFoundException(formatted));
  }

  /**
   * Updates a compatibility level for a <code>schemaName</code>.
   *
   * @param schemaName is a schema subject name
   * @see com.provectus.kafka.ui.model.CompatibilityLevelDTO.CompatibilityEnum
   */
  public Mono<Void> updateSchemaCompatibility(KafkaCluster cluster, @Nullable String schemaName,
                                              Mono<CompatibilityLevelDTO> compatibilityLevel) {
    String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
    return configuredWebClient(
            cluster,
            HttpMethod.PUT,
            configEndpoint,
        schemaName)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromPublisher(compatibilityLevel, CompatibilityLevelDTO.class))
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName)))
            .bodyToMono(Void.class)
            .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
                () -> this.updateSchemaCompatibility(cluster, schemaName, compatibilityLevel))));
  }

  public Mono<Void> updateSchemaCompatibility(KafkaCluster cluster,
                                              Mono<CompatibilityLevelDTO> compatibilityLevel) {
    return updateSchemaCompatibility(cluster, null, compatibilityLevel);
  }

  public Mono<InternalCompatibilityLevel> getSchemaCompatibilityLevel(KafkaCluster cluster,
                                                                 String schemaName) {
    String globalConfig = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
    final var values = new LinkedMultiValueMap<String, String>();
    values.add("defaultToGlobal", "true");
    return configuredWebClient(
        cluster,
        HttpMethod.GET,
        globalConfig,
        (schemaName == null ? Collections.emptyList() : List.of(schemaName)),
        values)
        .retrieve()
        .bodyToMono(InternalCompatibilityLevel.class)
        .onErrorResume(error -> Mono.empty());
  }

  public Mono<InternalCompatibilityLevel> getGlobalSchemaCompatibilityLevel(KafkaCluster cluster) {
    return this.getSchemaCompatibilityLevel(cluster, null);
  }

  private Mono<InternalCompatibilityLevel> getSchemaCompatibilityInfoOrGlobal(KafkaCluster cluster,
                                                                         String schemaName) {
    return this.getSchemaCompatibilityLevel(cluster, schemaName)
        .switchIfEmpty(this.getGlobalSchemaCompatibilityLevel(cluster));
  }

  public Mono<InternalCompatibilityCheck> checksSchemaCompatibility(
      KafkaCluster cluster, String schemaName, Mono<NewSchemaSubjectDTO> newSchemaSubject) {
    return configuredWebClient(
            cluster,
            HttpMethod.POST,
            "/compatibility/subjects/{schemaName}/versions/latest",
        schemaName)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubjectDTO.class))
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName)))
            .bodyToMono(InternalCompatibilityCheck.class)
            .as(m -> failoverAble(m, new FailoverMono<>(cluster.getSchemaRegistry(),
                () -> this.checksSchemaCompatibility(cluster, schemaName, newSchemaSubject))));
  }

  public String formatted(String str, Object... args) {
    try (Formatter formatter = new Formatter()) {
      return formatter.format(str, args).toString();
    }
  }

  private void setBasicAuthIfEnabled(InternalSchemaRegistry schemaRegistry, HttpHeaders headers) {
    if (schemaRegistry.getUsername() != null && schemaRegistry.getPassword() != null) {
      headers.setBasicAuth(
          schemaRegistry.getUsername(),
          schemaRegistry.getPassword()
      );
    } else if (schemaRegistry.getUsername() != null) {
      throw new ValidationException(
          "You specified username but did not specify password");
    } else if (schemaRegistry.getPassword() != null) {
      throw new ValidationException(
          "You specified password but did not specify username");
    }
  }

  private boolean isUnrecognizedFieldSchemaTypeMessage(String errorMessage) {
    return errorMessage.contains(UNRECOGNIZED_FIELD_SCHEMA_TYPE);
  }

  private boolean isIncompatibleSchemaMessage(String message) {
    return message.contains(INCOMPATIBLE_WITH_AN_EARLIER_SCHEMA);
  }

  private WebClient.RequestBodySpec configuredWebClient(KafkaCluster cluster, HttpMethod method,
                                                        String uri) {
    return configuredWebClient(cluster, method, uri, Collections.emptyList(),
        new LinkedMultiValueMap<>());
  }

  private WebClient.RequestBodySpec configuredWebClient(KafkaCluster cluster, HttpMethod method,
                                                        String uri, List<String> uriVariables) {
    return configuredWebClient(cluster, method, uri, uriVariables, new LinkedMultiValueMap<>());
  }

  private WebClient.RequestBodySpec configuredWebClient(KafkaCluster cluster, HttpMethod method,
                                                        String uri, @Nullable String uriVariable) {
    List<String> uriVariables = uriVariable == null ? Collections.emptyList() : List.of(uriVariable);
    return configuredWebClient(cluster, method, uri, uriVariables, new LinkedMultiValueMap<>());
  }

  private WebClient.RequestBodySpec configuredWebClient(KafkaCluster cluster,
                                                        HttpMethod method, String path,
                                                        List<String> uriVariables,
                                                        MultiValueMap<String, String> queryParams) {
    final var schemaRegistry = cluster.getSchemaRegistry();

    try {
      WebClient.Builder schemaRegistryWebClient = SecuredWebClient.configure(
          schemaRegistry.getKeystoreLocation(),
          schemaRegistry.getKeystorePassword(),
          schemaRegistry.getTruststoreLocation(),
          schemaRegistry.getTruststorePassword()
      );

      return schemaRegistryWebClient.build()
          .method(method)
          .uri(buildUri(schemaRegistry, path, uriVariables, queryParams))
          .headers(headers -> setBasicAuthIfEnabled(schemaRegistry, headers));
    } catch (Exception e) {
      throw new IllegalStateException(
          "cannot create TLS configuration for schema-registry in cluster " + cluster.getName(), e);
    }
  }

  private URI buildUri(InternalSchemaRegistry schemaRegistry, String path, List<String> uriVariables,
                       MultiValueMap<String, String> queryParams) {
    final var builder = UriComponentsBuilder
        .fromHttpUrl(schemaRegistry.getUri() + path);
    builder.queryParams(queryParams);
    return builder.build(uriVariables.toArray());
  }

  private Function<ClientResponse, Mono<? extends Throwable>> errorOnSchemaDeleteFailure(String schemaName) {
    return resp -> {
      if (NOT_FOUND.equals(resp.statusCode())) {
        return Mono.error(new SchemaNotFoundException(schemaName));
      }
      return Mono.error(new SchemaFailedToDeleteException(schemaName));
    };
  }

  private <T> Mono<T> failoverAble(Mono<T> request, FailoverMono<T> failoverMethod) {
    return request.onErrorResume(failoverMethod::failover);
  }

  private <T> Flux<T> failoverAble(Flux<T> request, FailoverFlux<T> failoverMethod) {
    return request.onErrorResume(failoverMethod::failover);
  }

  private abstract static class Failover<E> {
    private final InternalSchemaRegistry schemaRegistry;
    private final Supplier<E> failover;

    private Failover(InternalSchemaRegistry schemaRegistry, Supplier<E> failover) {
      this.schemaRegistry = Objects.requireNonNull(schemaRegistry);
      this.failover = Objects.requireNonNull(failover);
    }

    abstract E error(Throwable error);

    public E failover(Throwable error) {
      if (error instanceof WebClientRequestException
          && error.getCause() instanceof IOException
          && schemaRegistry.isFailoverAvailable()) {
        var uri = ((WebClientRequestException) error).getUri();
        schemaRegistry.markAsUnavailable(String.format("%s://%s", uri.getScheme(), uri.getAuthority()));
        return failover.get();
      }
      return error(error);
    }
  }

  private static class FailoverMono<T> extends Failover<Mono<T>> {

    private FailoverMono(InternalSchemaRegistry schemaRegistry, Supplier<Mono<T>> failover) {
      super(schemaRegistry, failover);
    }

    @Override
    Mono<T> error(Throwable error) {
      return Mono.error(error);
    }
  }

  private static class FailoverFlux<T> extends Failover<Flux<T>> {

    private FailoverFlux(InternalSchemaRegistry schemaRegistry, Supplier<Flux<T>> failover) {
      super(schemaRegistry, failover);
    }

    @Override
    Flux<T> error(Throwable error) {
      return Flux.error(error);
    }
  }
}
