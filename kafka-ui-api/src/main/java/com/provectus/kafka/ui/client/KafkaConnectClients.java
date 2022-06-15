package com.provectus.kafka.ui.client;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.util.unit.DataSize;

public final class KafkaConnectClients {

  private KafkaConnectClients() {

  }

  private static final Map<String, KafkaConnectClientApi> CACHE = new ConcurrentHashMap<>();

  public static KafkaConnectClientApi withKafkaConnectConfig(KafkaConnectCluster config, DataSize maxBuffSize) {
    return CACHE.computeIfAbsent(config.getAddress(), s -> new RetryingKafkaConnectClient(config, maxBuffSize));
  }
}
