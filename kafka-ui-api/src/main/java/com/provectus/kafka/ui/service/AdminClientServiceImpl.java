package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.SslPropertiesUtil;
import java.io.Closeable;
import java.time.Instant;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminClientServiceImpl implements AdminClientService, Closeable {

  private static final AtomicLong CLIENT_ID = new AtomicLong();

  private final Map<String, ReactiveAdminClient> adminClientCache = new ConcurrentHashMap<>();
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
          SslPropertiesUtil.addKafkaSslProperties(cluster.getOriginalProperties().getSsl(), properties);
          properties.putAll(cluster.getProperties());
          properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
          properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
          properties.putIfAbsent(
              AdminClientConfig.CLIENT_ID_CONFIG,
              "kafka-ui-client-" + Instant.now().getEpochSecond() + "-" + CLIENT_ID.incrementAndGet()
          );
          return AdminClient.create(properties);
        })
        .flatMap(ac -> ReactiveAdminClient.create(ac).doOnError(th -> ac.close()))
        .onErrorMap(th -> new IllegalStateException(
            "Error while creating AdminClient for Cluster " + cluster.getName(), th));
  }

  @Override
  public void close() {
    adminClientCache.values().forEach(ReactiveAdminClient::close);
  }
}
