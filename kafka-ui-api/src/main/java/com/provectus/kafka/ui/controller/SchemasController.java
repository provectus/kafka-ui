package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.SchemasApi;
import com.provectus.kafka.ui.service.SchemaRegistryService;
import com.provectus.kafka.ui.model.CompatibilityCheckResponse;
import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SchemaSubject;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class SchemasController implements SchemasApi {

  private final SchemaRegistryService schemaRegistryService;

  @Override
  public Mono<ResponseEntity<CompatibilityCheckResponse>> checkSchemaCompatibility(
      String clusterName, String subject, @Valid Mono<NewSchemaSubject> newSchemaSubject, ServerWebExchange exchange) {
    return schemaRegistryService.checksSchemaCompatibility(clusterName, subject, newSchemaSubject)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<SchemaSubject>> createNewSchema(String clusterName,
                                                             @Valid Mono<NewSchemaSubject> newSchemaSubject,
                                                             ServerWebExchange exchange) {
    return schemaRegistryService
        .registerNewSchema(clusterName, newSchemaSubject)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteLatestSchema(
      String clusterName, String subject, ServerWebExchange exchange) {
    return schemaRegistryService.deleteLatestSchemaSubject(clusterName, subject);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchema(
      String clusterName, String subjectName, ServerWebExchange exchange) {
    return schemaRegistryService.deleteSchemaSubjectEntirely(clusterName, subjectName);
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchemaByVersion(
      String clusterName, String subjectName, Integer version, ServerWebExchange exchange) {
    return schemaRegistryService.deleteSchemaSubjectByVersion(clusterName, subjectName, version);
  }

  @Override
  public Mono<ResponseEntity<Flux<SchemaSubject>>> getAllVersionsBySubject(
      String clusterName, String subjectName, ServerWebExchange exchange) {
    Flux<SchemaSubject> schemas = schemaRegistryService.getAllVersionsBySubject(clusterName, subjectName);
    return Mono.just(ResponseEntity.ok(schemas));
  }

  @Override
  public Mono<ResponseEntity<CompatibilityLevel>> getGlobalSchemaCompatibilityLevel(
      String clusterName, ServerWebExchange exchange) {
    return schemaRegistryService.getGlobalSchemaCompatibilityLevel(clusterName)
        .map(ResponseEntity::ok)
        .defaultIfEmpty(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<SchemaSubject>> getLatestSchema(String clusterName, String subject, ServerWebExchange exchange) {
    return schemaRegistryService.getLatestSchemaVersionBySubject(clusterName, subject).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<SchemaSubject>> getSchemaByVersion(
      String clusterName, String subject, Integer version, ServerWebExchange exchange) {
    return schemaRegistryService.getSchemaSubjectByVersion(clusterName, subject, version).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<SchemaSubject>>> getSchemas(String clusterName, ServerWebExchange exchange) {
    Flux<SchemaSubject> subjects = schemaRegistryService.getAllLatestVersionSchemas(clusterName);
    return Mono.just(ResponseEntity.ok(subjects));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateGlobalSchemaCompatibilityLevel(
      String clusterName, @Valid Mono<CompatibilityLevel> compatibilityLevel, ServerWebExchange exchange) {
    log.info("Updating schema compatibility globally");
    return schemaRegistryService.updateSchemaCompatibility(clusterName, compatibilityLevel)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> updateSchemaCompatibilityLevel(
      String clusterName, String subject, @Valid Mono<CompatibilityLevel> compatibilityLevel, ServerWebExchange exchange) {
    log.info("Updating schema compatibility for subject: {}", subject);
    return schemaRegistryService.updateSchemaCompatibility(clusterName, subject, compatibilityLevel)
        .map(ResponseEntity::ok);
  }
}
