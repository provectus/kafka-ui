package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.KafkaSslConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.io.Closeable;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.common.security.auth.SecurityProtocol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminClientServiceImpl implements AdminClientService, Closeable {
  private final Map<String, ReactiveAdminClient> adminClientCache = new ConcurrentHashMap<>();
  @Setter // used in tests
  @Value("${kafka.admin-client-timeout:30000}")
  private int clientTimeout;

  @Autowired
  private KafkaSslConfig kafkaSslConfig;

  @Override
  public Mono<ReactiveAdminClient> get(KafkaCluster cluster) {
    return Mono.justOrEmpty(adminClientCache.get(cluster.getName()))
        .switchIfEmpty(createAdminClient(cluster))
        .map(e -> adminClientCache.computeIfAbsent(cluster.getName(), key -> e));
  }

  private Mono<ReactiveAdminClient> createAdminClient(KafkaCluster cluster) {
    return Mono.fromSupplier(() -> {
      Properties properties = new Properties();
      properties.putAll(cluster.getProperties());
      properties
          .put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
      properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
      properties.putIfAbsent(AdminClientConfig.CLIENT_ID_CONFIG, "kafka-ui-admin-client-" + System.currentTimeMillis());
      properties.put(AdminClientConfig.SECURITY_PROTOCOL_CONFIG, SecurityProtocol.SSL.name);
      properties.putAll(this.kafkaSslConfig.getConfigsClientCertificate());
      properties.putAll(this.kafkaSslConfig.getConfigsTrustStore());
      return AdminClient.create(properties);
    })
        .flatMap(ReactiveAdminClient::create)
        .onErrorMap(th -> new IllegalStateException(
            "Error while creating AdminClient for Cluster " + cluster.getName(), th));
  }

  @Override
  public void close() {
    adminClientCache.values().forEach(ReactiveAdminClient::close);
  }
}
