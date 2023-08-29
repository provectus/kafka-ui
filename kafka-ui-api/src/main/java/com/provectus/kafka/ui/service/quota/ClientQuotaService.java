package com.provectus.kafka.ui.service.quota;

import static org.apache.kafka.common.quota.ClientQuotaEntity.CLIENT_ID;
import static org.apache.kafka.common.quota.ClientQuotaEntity.IP;
import static org.apache.kafka.common.quota.ClientQuotaEntity.USER;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import jakarta.annotation.Nullable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.quota.ClientQuotaAlteration;
import org.apache.kafka.common.quota.ClientQuotaEntity;
import org.apache.kafka.common.quota.ClientQuotaFilter;
import org.apache.kafka.common.quota.ClientQuotaFilterComponent;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ClientQuotaService {

  private final AdminClientService adminClientService;

  public Flux<ClientQuotaRecord> getAll(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.getClientQuotas(ClientQuotaFilter.all()))
        .flatMapIterable(Map::entrySet)
        .map(e -> ClientQuotaRecord.create(e.getKey(), e.getValue()));
  }

  //returns 201 if new entity was created, 200 if existing was updated, 204 if existing was deleted
  public Mono<HttpStatus> upsert(KafkaCluster cluster,
                                 @Nullable String user,
                                 @Nullable String clientId,
                                 @Nullable String ip,
                                 Map<String, Double> newQuotas) {
    ClientQuotaEntity quotaEntity = quotaEntity(user, clientId, ip);
    return adminClientService.get(cluster)
        .flatMap(ac ->
            findQuotas(ac, quotaEntity)
                .flatMap(currentQuotas -> {
                  HttpStatus result = HttpStatus.OK; //updated
                  if (newQuotas.isEmpty()) {
                    result = HttpStatus.NO_CONTENT; //deleted
                  } else if (currentQuotas.isEmpty()) {
                    result = HttpStatus.CREATED;
                  }
                  var alteration = createAlteration(quotaEntity, currentQuotas, newQuotas);
                  return ac.alterClientQuota(alteration)
                      .thenReturn(result);
                })
        );
  }

  private ClientQuotaEntity quotaEntity(@Nullable String user, @Nullable String clientId, @Nullable String ip) {
    if (Stream.of(user, clientId, ip).allMatch(Objects::isNull)) {
      throw new ValidationException("Quota entity id is not set");
    }
    var id = new HashMap<String, String>();
    Optional.ofNullable(user).ifPresent(u -> id.put(USER, u));
    Optional.ofNullable(clientId).ifPresent(cid -> id.put(CLIENT_ID, cid));
    Optional.ofNullable(ip).ifPresent(i -> id.put(IP, i));
    return new ClientQuotaEntity(id);
  }

  private ClientQuotaAlteration createAlteration(ClientQuotaEntity quotaEntity,
                                                 Map<String, Double> currentQuotas,
                                                 Map<String, Double> newQuotas) {
    Set<String> quotasToClear = Sets.difference(currentQuotas.keySet(), newQuotas.keySet());
    List<ClientQuotaAlteration.Op> ops = Stream.concat(
        quotasToClear.stream()
            .map(name -> new ClientQuotaAlteration.Op(name, null)), //setting null value to clear current state
        newQuotas.entrySet().stream()
            .map(e -> new ClientQuotaAlteration.Op(e.getKey(), e.getValue()))
    ).toList();
    return new ClientQuotaAlteration(quotaEntity, ops);
  }

  // returns empty map if no quotas found for an entity
  private Mono<Map<String, Double>> findQuotas(ReactiveAdminClient ac, ClientQuotaEntity quotaEntity) {
    return ac.getClientQuotas(crateSearchFilter(quotaEntity))
        .map(found -> Optional.ofNullable(found.get(quotaEntity)).orElse(Map.of()));
  }

  private ClientQuotaFilter crateSearchFilter(ClientQuotaEntity quotaEntity) {
    List<ClientQuotaFilterComponent> filters = new ArrayList<>();
    quotaEntity.entries().forEach((type, name) -> filters.add(ClientQuotaFilterComponent.ofEntity(type, name)));
    return ClientQuotaFilter.contains(filters);
  }
}
