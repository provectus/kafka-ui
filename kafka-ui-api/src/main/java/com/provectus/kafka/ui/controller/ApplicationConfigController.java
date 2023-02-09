package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.EDIT;
import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.VIEW;

import com.provectus.kafka.ui.api.ApplicationConfigApi;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.ApplicationConfigDTO;
import com.provectus.kafka.ui.model.ApplicationConfigPropertiesDTO;
import com.provectus.kafka.ui.model.ApplicationConfigValidationDTO;
import com.provectus.kafka.ui.model.ClusterConfigValidationDTO;
import com.provectus.kafka.ui.model.RestartRequestDTO;
import com.provectus.kafka.ui.model.UploadedFileInfoDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.KafkaClusterFactory;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.util.ApplicationRestarter;
import com.provectus.kafka.ui.util.DynamicConfigOperations;
import com.provectus.kafka.ui.util.DynamicConfigOperations.PropertiesStructure;
import com.provectus.kafka.ui.util.KafkaClusterValidator;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ApplicationConfigController implements ApplicationConfigApi {

  private static final PropertiesMapper MAPPER = Mappers.getMapper(PropertiesMapper.class);

  @Mapper
  interface PropertiesMapper {

    PropertiesStructure fromDto(ApplicationConfigPropertiesDTO dto);

    ApplicationConfigPropertiesDTO toDto(PropertiesStructure propertiesStructure);
  }

  private final AccessControlService accessControlService;
  private final DynamicConfigOperations dynamicConfigOperations;
  private final ApplicationRestarter restarter;
  private final KafkaClusterFactory kafkaClusterFactory;

  @Override
  public Mono<ResponseEntity<ApplicationConfigDTO>> getCurrentConfig(ServerWebExchange exchange) {
    return accessControlService
        .validateAccess(
            AccessContext.builder()
                .applicationConfigActions(VIEW)
                .build()
        )
        .then(Mono.fromSupplier(() -> ResponseEntity.ok(
            new ApplicationConfigDTO()
                .properties(MAPPER.toDto(dynamicConfigOperations.getCurrentProperties()))
        )));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartWithConfig(Mono<RestartRequestDTO> restartRequestDto,
                                                      ServerWebExchange exchange) {
    return accessControlService
        .validateAccess(
            AccessContext.builder()
                .applicationConfigActions(EDIT)
                .build()
        )
        .then(restartRequestDto)
        .map(dto -> {
          dynamicConfigOperations.persist(MAPPER.fromDto(dto.getConfig().getProperties()));
          restarter.requestRestart();
          return ResponseEntity.ok().build();
        });
  }

  @Override
  public Mono<ResponseEntity<UploadedFileInfoDTO>> uploadConfigRelatedFile(FilePart file, ServerWebExchange exchange) {
    return accessControlService
        .validateAccess(
            AccessContext.builder()
                .applicationConfigActions(EDIT)
                .build()
        )
        .then(dynamicConfigOperations.uploadConfigRelatedFile(file))
        .map(path -> new UploadedFileInfoDTO().location(path.toString()))
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ApplicationConfigValidationDTO>> validateConfig(Mono<ApplicationConfigDTO> configDto,
                                                                             ServerWebExchange exchange) {
    return configDto
        .flatMap(config -> {
          PropertiesStructure propertiesStructure = MAPPER.fromDto(config.getProperties());
          ClustersProperties clustersProperties = propertiesStructure.getKafka();
          return validateClustersConfig(clustersProperties)
              .map(validations -> new ApplicationConfigValidationDTO().clusters(validations));
        })
        .map(ResponseEntity::ok);
  }

  private Mono<Map<String, ClusterConfigValidationDTO>> validateClustersConfig(
      @Nullable ClustersProperties properties) {
    if (properties == null || properties.getClusters() == null) {
      return Mono.just(Map.of());
    }
    return Flux.fromIterable(properties.getClusters())
        .map(kafkaClusterFactory::create)
        .flatMap(c -> KafkaClusterValidator.validate(c).map(v -> Tuples.of(c.getName(), v)))
        .collectMap(Tuple2::getT1, Tuple2::getT2);
  }
}
