package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Data;


@Data
@Builder(toBuilder = true)
public class InternalClusterMetrics {

  public static InternalClusterMetrics empty() {
    return InternalClusterMetrics.builder()
        .brokers(List.of())
        .topics(Map.of())
        .status(ServerStatusDTO.OFFLINE)
        .zookeeperStatus(ServerStatusDTO.OFFLINE)
        .internalBrokerMetrics(Map.of())
        .metrics(List.of())
        .version("unknown")
        .build();
  }

  private final String version;

  private final ServerStatusDTO status;
  private final Throwable lastKafkaException;

  private final int brokerCount;
  private final int activeControllers;
  private final List<Integer> brokers;

  private final int topicCount;
  private final Map<String, InternalTopic> topics;

  // zk stats
  @Deprecated //use 'zookeeperStatus' field with enum type instead
  private final int zooKeeperStatusEnum;
  private final ServerStatusDTO zookeeperStatus;
  private final Throwable lastZookeeperException;

  // partitions stats
  private final int underReplicatedPartitionCount;
  private final int onlinePartitionCount;
  private final int offlinePartitionCount;
  private final int inSyncReplicasCount;
  private final int outOfSyncReplicasCount;

  // log dir stats
  @Nullable // will be null if log dir collection disabled
  private final Map<Integer, InternalBrokerDiskUsage> internalBrokerDiskUsage;

  // metrics from jmx
  private final BigDecimal bytesInPerSec;
  private final BigDecimal bytesOutPerSec;
  private final Map<Integer, JmxBrokerMetrics> internalBrokerMetrics;
  private final List<MetricDTO> metrics;

}
