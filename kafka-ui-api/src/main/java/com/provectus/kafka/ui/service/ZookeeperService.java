package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.ZooKeeperException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.ZooKeeper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZookeeperService {

  private final Map<String, ZooKeeper> cachedZkClient = new ConcurrentHashMap<>();

  @Value
  public static class ZkStatus {
    ServerStatusDTO status;
    @Nullable
    Throwable error;
  }

  public Mono<ZkStatus> getZkStatus(KafkaCluster kafkaCluster) {
    return Mono.fromSupplier(() ->
            new ZkStatus(
                isZookeeperOnline(kafkaCluster)
                    ? ServerStatusDTO.ONLINE
                    : ServerStatusDTO.OFFLINE, null))
        .onErrorResume(th -> Mono.just(new ZkStatus(ServerStatusDTO.OFFLINE, th)));
  }

  private boolean isZookeeperOnline(KafkaCluster kafkaCluster) {
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

  private boolean isZkClientConnected(ZooKeeper zkClient) {
    try {
      zkClient.getChildren("/brokers/ids", null);
    } catch (KeeperException e) {
      log.error("A zookeeper exception has occurred", e);
      return false;
    } catch (InterruptedException e) {
      log.error("Interrupted: ", e);
      Thread.currentThread().interrupt();
    }
    return true;
  }

  @Nullable
  private ZooKeeper getOrCreateZkClient(KafkaCluster cluster) {
    final var clusterName = cluster.getName();
    final var client = cachedZkClient.get(clusterName);
    if (client != null && client.getState() != ZooKeeper.States.CONNECTED) {
      cachedZkClient.remove(clusterName);
    }
    try {
      return cachedZkClient.computeIfAbsent(clusterName, n -> createClient(cluster));
    } catch (Exception e) {
      log.error("Error while creating zookeeper client for cluster {}", clusterName);
      return null;
    }
  }

  private ZooKeeper createClient(KafkaCluster cluster) {
    try {
      return new ZooKeeper(cluster.getZookeeper(), 60 * 1000, watchedEvent -> {
      });
    } catch (IOException e) {
      log.error("Error while creating a zookeeper client for cluster [{}]",
          cluster.getName());
      throw new ZooKeeperException(e);
    }
  }
}
