package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.I0Itec.zkclient.ZkClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Log4j2
public class ZookeeperService {

  private final Map<String, ZkClient> cachedZkClient = new ConcurrentHashMap<>();

  public boolean isZookeeperOnline(KafkaCluster kafkaCluster) {
    var isConnected = false;
    if (StringUtils.hasText(kafkaCluster.getZookeeper())) {
      var zkClient = getOrCreateZkClient(kafkaCluster);
      log.debug("Start getting Zookeeper metrics for kafkaCluster: {}", kafkaCluster.getName());
      if (zkClient != null) {
        isConnected = isZkClientConnected(zkClient);
      }
    }
    return isConnected;
  }

  private boolean isZkClientConnected(ZkClient zkClient) {
    zkClient.getChildren("/brokers/ids");
    return true;
  }

  private ZkClient getOrCreateZkClient(KafkaCluster cluster) {
    try {
      return cachedZkClient.computeIfAbsent(
          cluster.getName(),
          (n) -> new ZkClient(cluster.getZookeeper(), 1000)
      );
    } catch (Exception e) {
      log.error("Error while creating zookeeper client for cluster {}", cluster.getName());
      return null;
    }
  }
}
