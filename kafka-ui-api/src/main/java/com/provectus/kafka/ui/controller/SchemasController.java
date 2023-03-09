package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.SchemasApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.KafkaSrMapper;
import com.provectus.kafka.ui.mapper.KafkaSrMapperImpl;
import com.provectus.kafka.ui.model.CompatibilityCheckResponseDTO;
import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.NewSchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectsResponseDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.service.SchemaRegistryService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.stream.Collectors;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class SchemasController extends AbstractController implements SchemasApi {

  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final KafkaSrMapper kafkaSrMapper = new KafkaSrMapperImpl();

  private final SchemaRegistryService schemaRegistryService;
  private final AccessControlService accessControlService;

  @Override
  protected KafkaCluster getCluster(String clusterName) {
    var c = super.getCluster(clusterName);
    if (c.getSchemaRegistryClient() == null) {
      throw new ValidationException("Schema Registry is not set for cluster " + clusterName);
    }
    return c;
  }

  @Override
  public Mono<ResponseEntity<CompatibilityCheckResponseDTO>> checkSchemaCompatibility(
      String clusterName, String subject, @Valid Mono<NewSchemaSubjectDTO> newSchemaSubjectMono,
      ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subject)
        .schemaActions(SchemaAction.VIEW)
        .build());

    return validateAccess.then(
        newSchemaSubjectMono.flatMap(subjectDTO ->
                schemaRegistryService.checksSchemaCompatibility(
                    getCluster(clusterName),
                    subject,
                    kafkaSrMapper.fromDto(subjectDTO)
                ))
            .map(kafkaSrMapper::toDto)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> createNewSchema(
      String clusterName, @Valid Mono<NewSchemaSubjectDTO> newSchemaSubjectMono,
      ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schemaActions(SchemaAction.CREATE)
        .build());

    return validateAccess.then(
        newSchemaSubjectMono.flatMap(newSubject ->
                schemaRegistryService.registerNewSchema(
                    getCluster(clusterName),
                    newSubject.getSubject(),
                    kafkaSrMapper.fromDto(newSubject)
                )
            ).map(kafkaSrMapper::toDto)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteLatestSchema(
      String clusterName, String subject, ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subject)
        .schemaActions(SchemaAction.DELETE)
        .build());

    return validateAccess.then(
        schemaRegistryService.deleteLatestSchemaSubject(getCluster(clusterName), subject)
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchema(
      String clusterName, String subject, ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subject)
        .schemaActions(SchemaAction.DELETE)
        .build());

    return validateAccess.then(
        schemaRegistryService.deleteSchemaSubjectEntirely(getCluster(clusterName), subject)
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteSchemaByVersion(
      String clusterName, String subjectName, Integer version, ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subjectName)
        .schemaActions(SchemaAction.DELETE)
        .build());

    return validateAccess.then(
        schemaRegistryService.deleteSchemaSubjectByVersion(getCluster(clusterName), subjectName, version)
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<SchemaSubjectDTO>>> getAllVersionsBySubject(
      String clusterName, String subjectName, ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subjectName)
        .schemaActions(SchemaAction.VIEW)
        .build());

    Flux<SchemaSubjectDTO> schemas =
        schemaRegistryService.getAllVersionsBySubject(getCluster(clusterName), subjectName)
            .map(kafkaSrMapper::toDto);
    return validateAccess.thenReturn(ResponseEntity.ok(schemas));
  }

  @Override
  public Mono<ResponseEntity<CompatibilityLevelDTO>> getGlobalSchemaCompatibilityLevel(
      String clusterName, ServerWebExchange exchange) {
    return schemaRegistryService.getGlobalSchemaCompatibilityLevel(getCluster(clusterName))
        .map(c -> new CompatibilityLevelDTO().compatibility(kafkaSrMapper.toDto(c)))
        .map(ResponseEntity::ok)
        .defaultIfEmpty(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> getLatestSchema(String clusterName,
                                                                String subject,
                                                                ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subject)
        .schemaActions(SchemaAction.VIEW)
        .build());

    return validateAccess.then(
        schemaRegistryService.getLatestSchemaVersionBySubject(getCluster(clusterName), subject)
            .map(kafkaSrMapper::toDto)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectDTO>> getSchemaByVersion(
      String clusterName, String subject, Integer version, ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schema(subject)
        .schemaActions(SchemaAction.VIEW)
        .build());

    return validateAccess.then(
        schemaRegistryService.getSchemaSubjectByVersion(
                getCluster(clusterName), subject, version)
            .map(kafkaSrMapper::toDto)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<SchemaSubjectsResponseDTO>> getSchemas(String clusterName,
                                                                    @Valid Integer pageNum,
                                                                    @Valid Integer perPage,
                                                                    @Valid String search,
                                                                    ServerWebExchange serverWebExchange) {
    return schemaRegistryService
        .getAllSubjectNames(getCluster(clusterName))
        .flatMapIterable(l -> l)
        .filterWhen(schema -> accessControlService.isSchemaAccessible(schema, clusterName))
        .collectList()
        .flatMap(subjects -> {
          int pageSize = perPage != null && perPage > 0 ? perPage : DEFAULT_PAGE_SIZE;
          int subjectToSkip = ((pageNum != null && pageNum > 0 ? pageNum : 1) - 1) * pageSize;
          List<String> filteredSubjects = subjects
              .stream()
              .filter(subj -> search == null || StringUtils.containsIgnoreCase(subj, search))
              .sorted().toList();
          var totalPages = (filteredSubjects.size() / pageSize)
              + (filteredSubjects.size() % pageSize == 0 ? 0 : 1);
          List<String> subjectsToRender = filteredSubjects.stream()
              .skip(subjectToSkip)
              .limit(pageSize)
              .collect(Collectors.toList());
          return schemaRegistryService.getAllLatestVersionSchemas(getCluster(clusterName), subjectsToRender)
              .map(subjs -> subjs.stream().map(kafkaSrMapper::toDto).toList())
              .map(subjs -> new SchemaSubjectsResponseDTO().pageCount(totalPages).schemas(subjs));
        }).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> updateGlobalSchemaCompatibilityLevel(
      String clusterName, @Valid Mono<CompatibilityLevelDTO> compatibilityLevelMono,
      ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schemaActions(SchemaAction.MODIFY_GLOBAL_COMPATIBILITY)
        .build());

    return validateAccess.then(
        compatibilityLevelMono
            .flatMap(compatibilityLevelDTO ->
                schemaRegistryService.updateGlobalSchemaCompatibility(
                    getCluster(clusterName),
                    kafkaSrMapper.fromDto(compatibilityLevelDTO.getCompatibility())
                ))
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> updateSchemaCompatibilityLevel(
      String clusterName, String subject, @Valid Mono<CompatibilityLevelDTO> compatibilityLevelMono,
      ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .schemaActions(SchemaAction.EDIT)
        .build());

    return validateAccess.then(
        compatibilityLevelMono
            .flatMap(compatibilityLevelDTO ->
                schemaRegistryService.updateSchemaCompatibility(
                    getCluster(clusterName),
                    subject,
                    kafkaSrMapper.fromDto(compatibilityLevelDTO.getCompatibility())
                ))
            .thenReturn(ResponseEntity.ok().build())
    );
  }
}
