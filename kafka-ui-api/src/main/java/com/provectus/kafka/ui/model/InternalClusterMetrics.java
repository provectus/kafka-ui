package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;


@Data
@Builder(toBuilder = true)
public class InternalClusterMetrics {

  private final String version;

  private final ServerStatusDTO status;
  private final Throwable lastKafkaException;

  private final int zooKeeperStatus; //TODO deprecate and use enum?
  private final ServerStatusDTO zookeeperStatus;
  private final Throwable lastZookeeperException;

  private final int brokerCount;
  private final List<Integer> brokers;
  private final int activeControllers;

  private final int topicCount;
  private final Map<String, InternalTopic> topics;

  // partitions stats
  private final int underReplicatedPartitionCount;
  private final int onlinePartitionCount;
  private final int offlinePartitionCount;
  private final int inSyncReplicasCount;
  private final int outOfSyncReplicasCount;
  private final int uncleanLeaderElectionCount; // not used

  // log dir stats
  private final long segmentCount;
  private final long segmentSize;
  private final Map<Integer, InternalBrokerDiskUsage> internalBrokerDiskUsage;

  // jmx
  private final Map<String, BigDecimal> bytesInPerSec;
  private final Map<String, BigDecimal> bytesOutPerSec;
  private final Map<Integer, JmxBrokerMetrics> internalBrokerMetrics;
  private final List<MetricDTO> metrics;

}
