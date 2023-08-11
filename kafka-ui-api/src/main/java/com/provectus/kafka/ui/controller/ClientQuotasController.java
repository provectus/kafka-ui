package com.provectus.kafka.ui.controller;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.ClientQuotasApi;
import com.provectus.kafka.ui.model.ClientQuotasDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ClientQuotaAction;
import com.provectus.kafka.ui.service.quota.ClientQuotaRecord;
import com.provectus.kafka.ui.service.quota.ClientQuotaService;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ClientQuotasController extends AbstractController implements ClientQuotasApi {

  private final ClientQuotaService clientQuotaService;

  @Override
  public Mono<ResponseEntity<Flux<ClientQuotasDTO>>> listQuotas(String clusterName,
                                                                ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("listClientQuotas")
        .clientQuotaActions(ClientQuotaAction.VIEW)
        .build();

    Mono<ResponseEntity<Flux<ClientQuotasDTO>>> operation =
        Mono.just(clientQuotaService.list(getCluster(clusterName)).map(this::mapToDto))
            .map(ResponseEntity::ok);

    return validateAccess(context)
        .then(operation)
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> upsertClientQuotas(String clusterName,
                                                       Mono<ClientQuotasDTO> quotasDto,
                                                       ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("upsertClientQuotas")
        .clientQuotaActions(ClientQuotaAction.EDIT)
        .build();

    Mono<ResponseEntity<Void>> operation = quotasDto.flatMap(
        newQuotas ->
            clientQuotaService.upsert(
                getCluster(clusterName),
                newQuotas.getUser(),
                newQuotas.getClientId(),
                newQuotas.getIp(),
                Optional.ofNullable(newQuotas.getQuotas()).orElse(Map.of())
                    .entrySet()
                    .stream()
                    .collect(toMap(Map.Entry::getKey, e -> e.getValue().doubleValue()))
            )
    ).map(statusCode -> ResponseEntity.status(statusCode).build());

    return validateAccess(context)
        .then(operation)
        .doOnEach(sig -> audit(context, sig));
  }

  private ClientQuotasDTO mapToDto(ClientQuotaRecord quotaRecord) {
    return new ClientQuotasDTO()
        .user(quotaRecord.user())
        .clientId(quotaRecord.clientId())
        .ip(quotaRecord.ip())
        .quotas(
            quotaRecord.quotas().entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(toMap(
                    Map.Entry::getKey,
                    e -> BigDecimal.valueOf(e.getValue()),
                    (v1, v2) -> null, //won't be called
                    LinkedHashMap::new //to keep order
                ))
        );
  }

}
