package com.provectus.kafka.ui.controller;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.ClientQuotasApi;
import com.provectus.kafka.ui.model.ClientQuotasDTO;
import com.provectus.kafka.ui.service.audit.AuditService;
import com.provectus.kafka.ui.service.quota.ClientQuotaRecord;
import com.provectus.kafka.ui.service.quota.QuotaService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
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

  private final QuotaService quotaService;
  private final AccessControlService accessControlService;
  private final AuditService auditService;

  @Override
  public Mono<ResponseEntity<Flux<ClientQuotasDTO>>> listQuotas(String clusterName,
                                                                ServerWebExchange exchange) {
    return Mono.just(quotaService.list(getCluster(clusterName)).map(this::map))
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> upsertClientQuotas(String clusterName,
                                                       Mono<ClientQuotasDTO> clientQuotasDto,
                                                       ServerWebExchange exchange) {
    return clientQuotasDto.flatMap(
        quotas ->
            quotaService.upsert(
                getCluster(clusterName),
                quotas.getUser(),
                quotas.getClientId(),
                quotas.getIp(),
                Optional.ofNullable(quotas.getQuotas()).orElse(Map.of())
                    .entrySet()
                    .stream()
                    .collect(toMap(Map.Entry::getKey, e -> e.getValue().doubleValue()))
            )
    ).map(statusCode -> ResponseEntity.status(statusCode).build());
  }

  private ClientQuotasDTO map(ClientQuotaRecord quotaRecord) {
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
