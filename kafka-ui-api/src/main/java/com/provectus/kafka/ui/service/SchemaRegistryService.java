package com.provectus.kafka.ui.service;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.DuplicateEntityException;
import com.provectus.kafka.ui.exception.SchemaNotFoundException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.CompatibilityCheckResponse;
import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SchemaSubject;
import com.provectus.kafka.ui.model.SchemaType;
import com.provectus.kafka.ui.model.schemaregistry.ErrorResponse;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityCheck;
import com.provectus.kafka.ui.model.schemaregistry.InternalCompatibilityLevel;
import com.provectus.kafka.ui.model.schemaregistry.InternalNewSchema;
import com.provectus.kafka.ui.model.schemaregistry.SubjectIdResponse;
import java.util.Formatter;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryService {
  public static final String NO_SUCH_SCHEMA_VERSION = "No such schema %s with version %s";
  public static final String NO_SUCH_SCHEMA = "No such schema %s";

  private static final String URL_SUBJECTS = "/subjects";
  private static final String URL_SUBJECT = "/subjects/{schemaName}";
  private static final String URL_SUBJECT_VERSIONS = "/subjects/{schemaName}/versions";
  private static final String URL_SUBJECT_BY_VERSION = "/subjects/{schemaName}/versions/{version}";
  private static final String LATEST = "latest";

  private final ClustersStorage clustersStorage;
  private final ClusterMapper mapper;
  private final WebClient webClient;

  public Flux<SchemaSubject> getAllLatestVersionSchemas(String clusterName) {
    var allSubjectNames = getAllSubjectNames(clusterName);
    return allSubjectNames
        .flatMapMany(Flux::fromArray)
        .flatMap(subject -> getLatestSchemaVersionBySubject(clusterName, subject));
  }

  public Mono<String[]> getAllSubjectNames(String clusterName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.GET,
            URL_SUBJECTS)
            .retrieve()
            .bodyToMono(String[].class)
            .doOnError(log::error)
        )
        .orElse(Mono.error(ClusterNotFoundException::new));
  }

  public Flux<SchemaSubject> getAllVersionsBySubject(String clusterName, String subject) {
    Flux<Integer> versions = getSubjectVersions(clusterName, subject);
    return versions.flatMap(version -> getSchemaSubjectByVersion(clusterName, subject, version));
  }

  private Flux<Integer> getSubjectVersions(String clusterName, String schemaName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.GET,
            URL_SUBJECT_VERSIONS, schemaName)
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName))
            ).bodyToFlux(Integer.class)
        ).orElse(Flux.error(ClusterNotFoundException::new));
  }

  public Mono<SchemaSubject> getSchemaSubjectByVersion(String clusterName, String schemaName,
                                                       Integer version) {
    return this.getSchemaSubject(clusterName, schemaName, String.valueOf(version));
  }

  public Mono<SchemaSubject> getLatestSchemaVersionBySubject(String clusterName,
                                                             String schemaName) {
    return this.getSchemaSubject(clusterName, schemaName, LATEST);
  }

  private Mono<SchemaSubject> getSchemaSubject(String clusterName, String schemaName,
                                               String version) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.GET,
            URL_SUBJECT_BY_VERSION, schemaName, version)
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA_VERSION, schemaName, version))
            ).bodyToMono(SchemaSubject.class)
            .map(this::withSchemaType)
            .zipWith(getSchemaCompatibilityInfoOrGlobal(clusterName, schemaName))
            .map(tuple -> {
              SchemaSubject schema = tuple.getT1();
              String compatibilityLevel = tuple.getT2().getCompatibility().getValue();
              schema.setCompatibilityLevel(compatibilityLevel);
              return schema;
            })
        )
        .orElse(Mono.error(ClusterNotFoundException::new));
  }

  /**
   * If {@link SchemaSubject#getSchemaType()} is null, then AVRO, otherwise,
   * adds the schema type as is.
   */
  @NotNull
  private SchemaSubject withSchemaType(SchemaSubject s) {
    return s.schemaType(Optional.ofNullable(s.getSchemaType()).orElse(SchemaType.AVRO));
  }

  public Mono<ResponseEntity<Void>> deleteSchemaSubjectByVersion(String clusterName,
                                                                 String schemaName,
                                                                 Integer version) {
    return this.deleteSchemaSubject(clusterName, schemaName, String.valueOf(version));
  }

  public Mono<ResponseEntity<Void>> deleteLatestSchemaSubject(String clusterName,
                                                              String schemaName) {
    return this.deleteSchemaSubject(clusterName, schemaName, LATEST);
  }

  private Mono<ResponseEntity<Void>> deleteSchemaSubject(String clusterName, String schemaName,
                                                         String version) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.DELETE,
            URL_SUBJECT_BY_VERSION, schemaName, version)
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA_VERSION, schemaName, version))
            ).toBodilessEntity()
        ).orElse(Mono.error(ClusterNotFoundException::new));
  }

  public Mono<ResponseEntity<Void>> deleteSchemaSubjectEntirely(String clusterName,
                                                                String schemaName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.DELETE,
            URL_SUBJECT, schemaName)
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName))
            )
            .toBodilessEntity())
        .orElse(Mono.error(ClusterNotFoundException::new));
  }

  /**
   * Checks whether the provided schema duplicates the previous or not, creates a new schema
   * and then returns the whole content by requesting its latest version.
   */
  public Mono<SchemaSubject> registerNewSchema(String clusterName,
                                               Mono<NewSchemaSubject> newSchemaSubject) {
    return newSchemaSubject
        .flatMap(schema -> {
          SchemaType schemaType =
              SchemaType.AVRO == schema.getSchemaType() ? null : schema.getSchemaType();
          Mono<InternalNewSchema> newSchema =
              Mono.just(new InternalNewSchema(schema.getSchema(), schemaType));
          String subject = schema.getSubject();
          return clustersStorage.getClusterByName(clusterName)
              .map(KafkaCluster::getSchemaRegistry)
              .map(
                  schemaRegistry -> checkSchemaOnDuplicate(subject, newSchema, schemaRegistry)
                      .flatMap(s -> submitNewSchema(subject, newSchema, schemaRegistry))
                      .flatMap(resp -> getLatestSchemaVersionBySubject(clusterName, subject))
              )
              .orElse(Mono.error(ClusterNotFoundException::new));
        });
  }

  @NotNull
  private Mono<SubjectIdResponse> submitNewSchema(String subject,
                                                  Mono<InternalNewSchema> newSchemaSubject,
                                                  InternalSchemaRegistry schemaRegistry) {
    return configuredWebClient(
        schemaRegistry,
        HttpMethod.POST,
        URL_SUBJECT_VERSIONS, subject)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromPublisher(newSchemaSubject, InternalNewSchema.class))
        .retrieve()
        .onStatus(UNPROCESSABLE_ENTITY::equals,
            r -> r.bodyToMono(ErrorResponse.class)
                .flatMap(x -> Mono.error(new UnprocessableEntityException(x.getMessage()))))
        .bodyToMono(SubjectIdResponse.class);
  }

  @NotNull
  private Mono<SchemaSubject> checkSchemaOnDuplicate(String subject,
                                                     Mono<InternalNewSchema> newSchemaSubject,
                                                     InternalSchemaRegistry schemaRegistry) {
    return configuredWebClient(
        schemaRegistry,
        HttpMethod.POST,
        URL_SUBJECT, subject)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromPublisher(newSchemaSubject, InternalNewSchema.class))
        .retrieve()
        .onStatus(NOT_FOUND::equals, res -> Mono.empty())
        .onStatus(UNPROCESSABLE_ENTITY::equals,
            r -> r.bodyToMono(ErrorResponse.class)
                .flatMap(x -> Mono.error(new UnprocessableEntityException(x.getMessage()))))
        .bodyToMono(SchemaSubject.class)
        .filter(s -> Objects.isNull(s.getId()))
        .switchIfEmpty(Mono.error(new DuplicateEntityException("Such schema already exists")));
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
   * @see com.provectus.kafka.ui.model.CompatibilityLevel.CompatibilityEnum
   */
  public Mono<Void> updateSchemaCompatibility(String clusterName, String schemaName,
                                              Mono<CompatibilityLevel> compatibilityLevel) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> {
          String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
          return configuredWebClient(
              cluster,
              HttpMethod.PUT,
              configEndpoint, schemaName)
              .contentType(MediaType.APPLICATION_JSON)
              .body(BodyInserters.fromPublisher(compatibilityLevel, CompatibilityLevel.class))
              .retrieve()
              .onStatus(NOT_FOUND::equals,
                  throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName)))
              .bodyToMono(Void.class);
        }).orElse(Mono.error(ClusterNotFoundException::new));
  }

  public Mono<Void> updateSchemaCompatibility(String clusterName,
                                              Mono<CompatibilityLevel> compatibilityLevel) {
    return updateSchemaCompatibility(clusterName, null, compatibilityLevel);
  }

  public Mono<CompatibilityLevel> getSchemaCompatibilityLevel(String clusterName,
                                                              String schemaName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> {
          String configEndpoint = Objects.isNull(schemaName) ? "/config" : "/config/{schemaName}";
          return configuredWebClient(
              cluster,
              HttpMethod.GET,
              configEndpoint, schemaName)
              .retrieve()
              .bodyToMono(InternalCompatibilityLevel.class)
              .map(mapper::toCompatibilityLevel)
              .onErrorResume(error -> Mono.empty());
        }).orElse(Mono.empty());
  }

  public Mono<CompatibilityLevel> getGlobalSchemaCompatibilityLevel(String clusterName) {
    return this.getSchemaCompatibilityLevel(clusterName, null);
  }

  private Mono<CompatibilityLevel> getSchemaCompatibilityInfoOrGlobal(String clusterName,
                                                                      String schemaName) {
    return this.getSchemaCompatibilityLevel(clusterName, schemaName)
        .switchIfEmpty(this.getGlobalSchemaCompatibilityLevel(clusterName));
  }

  public Mono<CompatibilityCheckResponse> checksSchemaCompatibility(
      String clusterName, String schemaName, Mono<NewSchemaSubject> newSchemaSubject) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> configuredWebClient(
            cluster,
            HttpMethod.POST,
            "/compatibility/subjects/{schemaName}/versions/latest", schemaName)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromPublisher(newSchemaSubject, NewSchemaSubject.class))
            .retrieve()
            .onStatus(NOT_FOUND::equals,
                throwIfNotFoundStatus(formatted(NO_SUCH_SCHEMA, schemaName)))
            .bodyToMono(InternalCompatibilityCheck.class)
            .map(mapper::toCompatibilityCheckResponse)
            .log()
        ).orElse(Mono.error(ClusterNotFoundException::new));
  }

  public String formatted(String str, Object... args) {
    return new Formatter().format(str, args).toString();
  }

  private void setBasicAuthIfEnabled(InternalSchemaRegistry schemaRegistry, HttpHeaders headers) {
    if (schemaRegistry.getUsername() != null && schemaRegistry.getPassword() != null) {
      headers.setBasicAuth(
          schemaRegistry.getUsername(),
          schemaRegistry.getPassword()
      );
    } else if (schemaRegistry.getUsername() != null) {
      throw new ValidationException(
          "You specified username but do not specified password");
    } else if (schemaRegistry.getPassword() != null) {
      throw new ValidationException(
          "You specified password but do not specified username");
    }
  }

  private WebClient.RequestBodySpec configuredWebClient(KafkaCluster cluster, HttpMethod method,
                                                        String uri, Object... params) {
    return configuredWebClient(cluster.getSchemaRegistry(), method, uri, params);
  }

  private WebClient.RequestBodySpec configuredWebClient(InternalSchemaRegistry schemaRegistry,
                                                        HttpMethod method, String uri,
                                                        Object... params) {
    return webClient
        .method(method)
        .uri(schemaRegistry.getFirstUrl() + uri, params)
        .headers(headers -> setBasicAuthIfEnabled(schemaRegistry, headers));
  }
}
