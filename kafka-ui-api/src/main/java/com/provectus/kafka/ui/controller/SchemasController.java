package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.SchemasApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.CompatibilityCheckResponseDTO;
import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.NewSchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.service.SchemaRegistryService;
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
public class SchemasController extends AbstractController implements SchemasApi {

  private final SchemaRegistryService schemaRegistryService;

  @Override
  protected KafkaCluster getCluster(String clusterName) {
    var c = super.getCluster(clusterName);
    if (c.getSchemaRegistry() == null) {
      throw new ValidationException("Schema Registry is not set for cluster " + clusterName);
    }
    return c;
  }

  @Override
  public Mono<ResponseEntity<CompatibilityCheckResponseDTO>> checkSchemaCompatibility(
      String clusterName, String subject, @Valid Mono<NewSchemaSubjectDTO> newSchemaSubject,
      ServerWebExchange exchange) {
    return schemaRegistryService.checksSchemaCompatibility(
            getCluster(clusterName), subject, newSchemaSubject)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> createNewSchema(
      String clusterName, @Valid Mono<NewSchemaSubjectDTO> newSchemaSubject,
      ServerWebExchange exchange) {
    return schemaRegistryService
        .registerNewSchema(getCluster(clusterName), newSchemaSubject)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteLatestSchema(
      String clusterName, String subject, ServerWebExchange exchange) {
    return schemaRegistryService.deleteLatestSchemaSubject(getCluster(clusterName), subject);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchema(
      String clusterName, String subjectName, ServerWebExchange exchange) {
    return schemaRegistryService.deleteSchemaSubjectEntirely(getCluster(clusterName), subjectName)
            .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchemaByVersion(
      String clusterName, String subjectName, Integer version, ServerWebExchange exchange) {
    return schemaRegistryService.deleteSchemaSubjectByVersion(
        getCluster(clusterName), subjectName, version);
  }

  @Override
  public Mono<ResponseEntity<Flux<SchemaSubjectDTO>>> getAllVersionsBySubject(
      String clusterName, String subjectName, ServerWebExchange exchange) {
    Flux<SchemaSubjectDTO> schemas =
        schemaRegistryService.getAllVersionsBySubject(getCluster(clusterName), subjectName);
    return Mono.just(ResponseEntity.ok(schemas));
  }

  @Override
  public Mono<ResponseEntity<CompatibilityLevelDTO>> getGlobalSchemaCompatibilityLevel(
      String clusterName, ServerWebExchange exchange) {
    return schemaRegistryService.getGlobalSchemaCompatibilityLevel(getCluster(clusterName))
        .map(ResponseEntity::ok)
        .defaultIfEmpty(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> getLatestSchema(String clusterName, String subject,
                                                             ServerWebExchange exchange) {
    return schemaRegistryService.getLatestSchemaVersionBySubject(getCluster(clusterName), subject)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> getSchemaByVersion(
      String clusterName, String subject, Integer version, ServerWebExchange exchange) {
    return schemaRegistryService.getSchemaSubjectByVersion(
        getCluster(clusterName), subject, version)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<SchemaSubjectDTO>>> getSchemas(String clusterName,
                                                              ServerWebExchange exchange) {
    Flux<SchemaSubjectDTO> subjects = schemaRegistryService.getAllLatestVersionSchemas(
        getCluster(clusterName)
    );
    return Mono.just(ResponseEntity.ok(subjects));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateGlobalSchemaCompatibilityLevel(
      String clusterName, @Valid Mono<CompatibilityLevelDTO> compatibilityLevel,
      ServerWebExchange exchange) {
    log.info("Updating schema compatibility globally");
    return schemaRegistryService.updateSchemaCompatibility(
        getCluster(clusterName), compatibilityLevel)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> updateSchemaCompatibilityLevel(
      String clusterName, String subject, @Valid Mono<CompatibilityLevelDTO> compatibilityLevel,
      ServerWebExchange exchange) {
    log.info("Updating schema compatibility for subject: {}", subject);
    return schemaRegistryService.updateSchemaCompatibility(
        getCluster(clusterName), subject, compatibilityLevel)
        .map(ResponseEntity::ok);
  }
}
