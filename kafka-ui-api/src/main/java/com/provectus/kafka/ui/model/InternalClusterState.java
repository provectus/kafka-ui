package com.provectus.kafka.ui.model;

import com.google.common.base.Throwables;
import com.provectus.kafka.ui.service.MetricsCache;
import com.provectus.kafka.ui.util.JmxMetricsName;
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

  public InternalClusterState(KafkaCluster cluster, MetricsCache.Metrics metrics) {
    name = cluster.getName();
    status = metrics.getStatus();
    lastError = Optional.ofNullable(metrics.getLastKafkaException())
        .map(e -> new MetricsCollectionErrorDTO()
            .message(e.getMessage())
            .stackTrace(Throwables.getStackTraceAsString(e)))
        .orElse(null);
    topicCount = metrics.getTopicDescriptions().size();
    brokerCount = metrics.getClusterDescription().getNodes().size();
    activeControllers = metrics.getClusterDescription().getController() != null ? 1 : 0;
    version = metrics.getVersion();

    if (metrics.getLogDirInfo() != null) {
      diskUsage = metrics.getLogDirInfo().getBrokerStats().entrySet().stream()
          .map(e -> new BrokerDiskUsageDTO()
              .brokerId(e.getKey())
              .segmentSize(e.getValue().getSegmentSize())
              .segmentCount(e.getValue().getSegmentsCount()))
          .collect(Collectors.toList());
    }

    features = metrics.getFeatures();

    bytesInPerSec = metrics
        .getPrometheusMetricsDto()
        .getBigDecimalMetric(JmxMetricsName.BYTES_IN_PER_SEC.getPrometheusName())
        .orElse(metrics
                .getJmxMetrics()
                .getBytesInPerSec()
                .values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));

    bytesOutPerSec = metrics.getPrometheusMetricsDto()
        .getBigDecimalMetric(JmxMetricsName.BYTES_OUT_PER_SEC.getPrometheusName())
        .orElse(
            metrics.getJmxMetrics()
                .getBytesOutPerSec()
                .values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));

    var partitionsStats = new PartitionsStats(metrics.getTopicDescriptions().values());
    onlinePartitionCount = partitionsStats.getOnlinePartitionCount();
    offlinePartitionCount = partitionsStats.getOfflinePartitionCount();
    inSyncReplicasCount = partitionsStats.getInSyncReplicasCount();
    outOfSyncReplicasCount = partitionsStats.getOutOfSyncReplicasCount();
    underReplicatedPartitionCount = partitionsStats.getUnderReplicatedPartitionCount();
    readOnly = cluster.isReadOnly();
  }

}
