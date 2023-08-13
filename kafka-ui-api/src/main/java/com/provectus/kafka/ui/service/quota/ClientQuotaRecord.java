package com.provectus.kafka.ui.service.quota;

import jakarta.annotation.Nullable;
import java.util.Map;
import org.apache.kafka.common.quota.ClientQuotaEntity;

public record ClientQuotaRecord(@Nullable String user,
                                @Nullable String clientId,
                                @Nullable String ip,
                                Map<String, Double> quotas) {

  static ClientQuotaRecord create(ClientQuotaEntity entity, Map<String, Double> quotas) {
    return new ClientQuotaRecord(
        entity.entries().get(ClientQuotaEntity.USER),
        entity.entries().get(ClientQuotaEntity.CLIENT_ID),
        entity.entries().get(ClientQuotaEntity.IP),
        quotas
    );
  }
}
