package com.provectus.kafka.ui.service.quota;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import jakarta.annotation.Nullable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.quota.ClientQuotaEntity;
import org.apache.kafka.common.quota.ClientQuotaFilter;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class QuotaService {

  private final AdminClientService adminClientService;

  public Flux<ClientQuotaRecord> all(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.getClientQuotas(ClientQuotaFilter.all()))
        .flatMapIterable(map ->
            map.entrySet().stream().map(e -> ClientQuotaRecord.create(e.getKey(), e.getValue())).toList());
  }

  //returns 201 is new entity was created, 204 if exsiting was updated
  public Mono<HttpStatusCode> upsert(KafkaCluster cluster,
                                     @Nullable String user,
                                     @Nullable String clientId,
                                     @Nullable String ip,
                                     Map<String, Double> quotas) {

  }
}
