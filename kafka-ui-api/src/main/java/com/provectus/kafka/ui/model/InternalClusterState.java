package com.provectus.kafka.ui.model;

import com.google.common.base.Throwables;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Data;

@Data
public class InternalClusterState {
  private String name;
  private ServerStatusDTO status;
  private MetricsCollectionErrorDTO lastError;
  private Integer topicCount;
  private Integer brokerCount;
  private Integer activeControllers;
  private Integer onlinePartitionCount;
  private Integer offlinePartitionCount;
  private Integer inSyncReplicasCount;
  private Integer outOfSyncReplicasCount;
  private Integer underReplicatedPartitionCount;
  private List<BrokerDiskUsageDTO> diskUsage;
  private String version;
  private List<Feature> features;
  private BigDecimal bytesInPerSec;
  private BigDecimal bytesOutPerSec;
  private Boolean readOnly;

  public InternalClusterState(KafkaCluster cluster, Statistics statistics) {
    name = cluster.getName();
    status = statistics.getStatus();
    lastError = Optional.ofNullable(statistics.getLastKafkaException())
        .map(e -> new MetricsCollectionErrorDTO()
            .message(e.getMessage())
            .stackTrace(Throwables.getStackTraceAsString(e)))
        .orElse(null);
    topicCount = statistics.getTopicDescriptions().size();
    brokerCount = statistics.getClusterDescription().getNodes().size();
    activeControllers = statistics.getClusterDescription().getController() != null ? 1 : 0;
    version = statistics.getVersion();

    if (statistics.getLogDirInfo() != null) {
      diskUsage = statistics.getLogDirInfo().getBrokerStats().entrySet().stream()
          .map(e -> new BrokerDiskUsageDTO()
              .brokerId(e.getKey())
              .segmentSize(e.getValue().getSegmentSize())
              .segmentCount(e.getValue().getSegmentsCount()))
          .collect(Collectors.toList());
    }

    features = statistics.getFeatures();

    bytesInPerSec = statistics
        .getMetrics()
        .getBytesInPerSec()
        .values().stream()
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    bytesOutPerSec = statistics
        .getMetrics()
        .getBytesOutPerSec()
        .values().stream()
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    var partitionsStats = new PartitionsStats(statistics.getTopicDescriptions().values());
    onlinePartitionCount = partitionsStats.getOnlinePartitionCount();
    offlinePartitionCount = partitionsStats.getOfflinePartitionCount();
    inSyncReplicasCount = partitionsStats.getInSyncReplicasCount();
    outOfSyncReplicasCount = partitionsStats.getOutOfSyncReplicasCount();
    underReplicatedPartitionCount = partitionsStats.getUnderReplicatedPartitionCount();
    readOnly = cluster.isReadOnly();
  }

}
