package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.EDIT;
import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.VIEW;

import com.provectus.kafka.ui.api.ApplicationConfigApi;
import com.provectus.kafka.ui.model.ApplicationConfigDTO;
import com.provectus.kafka.ui.model.ApplicationConfigPropertiesDTO;
import com.provectus.kafka.ui.model.RestartRequestDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.util.ApplicationRestarter;
import com.provectus.kafka.ui.util.DynamicConfigOperations;
import com.provectus.kafka.ui.util.DynamicConfigOperations.PropertiesStructure;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

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
}
