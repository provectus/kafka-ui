package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class AdminClientServiceImpl implements AdminClientService {
  private final Map<String, ExtendedAdminClient> adminClientCache = new ConcurrentHashMap<>();
  @Setter // used in tests
  @Value("${kafka.admin-client-timeout}")
  private int clientTimeout;

  @Override
  public Mono<ExtendedAdminClient> getOrCreateAdminClient(KafkaCluster cluster) {
    return Mono.justOrEmpty(adminClientCache.get(cluster.getName()))
        .switchIfEmpty(createAdminClient(cluster))
        .map(e -> adminClientCache.computeIfAbsent(cluster.getName(), key -> e));
  }

  @Override
  public Mono<ExtendedAdminClient> createAdminClient(KafkaCluster cluster) {
    return Mono.fromSupplier(() -> {
      Properties properties = new Properties();
      properties.putAll(cluster.getProperties());
      properties
          .put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
      properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
      return AdminClient.create(properties);
    }).flatMap(ExtendedAdminClient::extendedAdminClient);
  }
}
