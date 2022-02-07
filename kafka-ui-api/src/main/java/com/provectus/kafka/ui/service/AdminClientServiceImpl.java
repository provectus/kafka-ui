package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.util.KafkaConstants.TRUSTSTORE_LOCATION;
import static com.provectus.kafka.ui.util.KafkaConstants.TRUSTSTORE_PASSWORD;

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
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminClientServiceImpl implements AdminClientService, Closeable {
  private final Map<String, ReactiveAdminClient> adminClientCache = new ConcurrentHashMap<>();

  private final Environment environment;

  @Setter // used in tests
  @Value("${kafka.admin-client-timeout:30000}")
  private int clientTimeout;

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

      properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
      properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);

      properties.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG,
          environment.getProperty(TRUSTSTORE_LOCATION));
      properties.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG,
          environment.getProperty(TRUSTSTORE_PASSWORD));

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
