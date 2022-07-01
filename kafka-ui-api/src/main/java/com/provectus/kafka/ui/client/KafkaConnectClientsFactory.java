package com.provectus.kafka.ui.client;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.model.KafkaConnectCluster;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;

@Service
public class KafkaConnectClientsFactory {

  @Value("${webclient.max-in-memory-buffer-size:20MB}")
  private DataSize maxBuffSize;

  private final Map<String, KafkaConnectClientApi> cache = new ConcurrentHashMap<>();

  public KafkaConnectClientApi withKafkaConnectConfig(KafkaConnectCluster config) {
    return cache.computeIfAbsent(config.getAddress(), s -> new RetryingKafkaConnectClient(config, maxBuffSize));
  }
}
