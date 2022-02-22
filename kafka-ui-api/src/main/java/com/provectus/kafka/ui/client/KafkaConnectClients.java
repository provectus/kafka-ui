package com.provectus.kafka.ui.client;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class KafkaConnectClients {

  private KafkaConnectClients() {

  }

  private static final Map<String, KafkaConnectClientApi> CACHE = new ConcurrentHashMap<>();

  public static KafkaConnectClientApi withBaseUrl(String basePath) {
    return CACHE.computeIfAbsent(basePath, RetryingKafkaConnectClient::new);
  }
}
