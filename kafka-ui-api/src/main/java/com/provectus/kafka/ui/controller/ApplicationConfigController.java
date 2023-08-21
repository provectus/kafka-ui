package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.EDIT;
import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.VIEW;

import com.provectus.kafka.ui.api.ApplicationConfigApi;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.ApplicationConfigDTO;
import com.provectus.kafka.ui.model.ApplicationConfigPropertiesDTO;
import com.provectus.kafka.ui.model.ApplicationConfigValidationDTO;
import com.provectus.kafka.ui.model.ApplicationInfoDTO;
import com.provectus.kafka.ui.model.ClusterConfigValidationDTO;
import com.provectus.kafka.ui.model.RestartRequestDTO;
import com.provectus.kafka.ui.model.UploadedFileInfoDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.ApplicationInfoService;
import com.provectus.kafka.ui.service.KafkaClusterFactory;
import com.provectus.kafka.ui.util.ApplicationRestarter;
import com.provectus.kafka.ui.util.DynamicConfigOperations;
import com.provectus.kafka.ui.util.DynamicConfigOperations.PropertiesStructure;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.codec.multipart.Part;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ApplicationConfigController extends AbstractController implements ApplicationConfigApi {

  private static final PropertiesMapper MAPPER = Mappers.getMapper(PropertiesMapper.class);

  @Mapper
  interface PropertiesMapper {

    PropertiesStructure fromDto(ApplicationConfigPropertiesDTO dto);

    ApplicationConfigPropertiesDTO toDto(PropertiesStructure propertiesStructure);
  }

  private final DynamicConfigOperations dynamicConfigOperations;
  private final ApplicationRestarter restarter;
  private final KafkaClusterFactory kafkaClusterFactory;
  private final ApplicationInfoService applicationInfoService;

  @Override
  public Mono<ResponseEntity<ApplicationInfoDTO>> getApplicationInfo(ServerWebExchange exchange) {
    return Mono.just(applicationInfoService.getApplicationInfo()).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ApplicationConfigDTO>> getCurrentConfig(ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .applicationConfigActions(VIEW)
        .operationName("getCurrentConfig")
        .build();
    return validateAccess(context)
        .then(Mono.fromSupplier(() -> ResponseEntity.ok(
            new ApplicationConfigDTO()
                .properties(MAPPER.toDto(dynamicConfigOperations.getCurrentProperties()))
        )))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartWithConfig(Mono<RestartRequestDTO> restartRequestDto,
                                                      ServerWebExchange exchange) {
    var context =  AccessContext.builder()
        .applicationConfigActions(EDIT)
        .operationName("restartWithConfig")
        .build();
    return validateAccess(context)
        .then(restartRequestDto)
        .doOnNext(restartDto -> {
          var newConfig = MAPPER.fromDto(restartDto.getConfig().getProperties());
          dynamicConfigOperations.persist(newConfig);
        })
        .doOnEach(sig -> audit(context, sig))
        .doOnSuccess(dto -> restarter.requestRestart())
        .map(dto -> ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<UploadedFileInfoDTO>> uploadConfigRelatedFile(Flux<Part> fileFlux,
                                                                           ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .applicationConfigActions(EDIT)
        .operationName("uploadConfigRelatedFile")
        .build();
    return validateAccess(context)
        .then(fileFlux.single())
        .flatMap(file ->
            dynamicConfigOperations.uploadConfigRelatedFile((FilePart) file)
                .map(path -> new UploadedFileInfoDTO().location(path.toString()))
                .map(ResponseEntity::ok))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ApplicationConfigValidationDTO>> validateConfig(Mono<ApplicationConfigDTO> configDto,
                                                                             ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .applicationConfigActions(EDIT)
        .operationName("validateConfig")
        .build();
    return validateAccess(context)
        .then(configDto)
        .flatMap(config -> {
          PropertiesStructure newConfig = MAPPER.fromDto(config.getProperties());
          ClustersProperties clustersProperties = newConfig.getKafka();
          return validateClustersConfig(clustersProperties)
              .map(validations -> new ApplicationConfigValidationDTO().clusters(validations));
        })
        .map(ResponseEntity::ok)
        .doOnEach(sig -> audit(context, sig));
  }

  private Mono<Map<String, ClusterConfigValidationDTO>> validateClustersConfig(
      @Nullable ClustersProperties properties) {
    if (properties == null || properties.getClusters() == null) {
      return Mono.just(Map.of());
    }
    properties.validateAndSetDefaults();
    return Flux.fromIterable(properties.getClusters())
        .flatMap(c -> kafkaClusterFactory.validate(c).map(v -> Tuples.of(c.getName(), v)))
        .collectMap(Tuple2::getT1, Tuple2::getT2);
  }
}
