package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;
import static com.provectus.kafka.ui.service.ZookeeperService.ZkStatus;
import static com.provectus.kafka.ui.util.JmxClusterUtil.JmxMetrics;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summarizingLong;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.util.ClusterUtil;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import java.math.BigDecimal;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
@Log4j2
public class MetricsService {

  private final ZookeeperService zookeeperService;
  private final JmxClusterUtil jmxClusterUtil;
  private final AdminClientService adminClientService;
  private final FeatureService featureService;
  private final TopicsService topicsService;

  /**
   * Updates cluster's metrics and topics structure.
   *
   * @param cluster to be updated
   * @return cluster with up-to-date metrics and topics structure
   */
  public Mono<KafkaCluster> updateClusterMetrics(KafkaCluster cluster) {
    return getMetrics(cluster)
        .map(m -> cluster.toBuilder().metrics(m).build())
        .zipWith(featureService.getAvailableFeatures(cluster),
            (c, features) -> c.toBuilder().features(features).build());
  }

  private Mono<InternalClusterMetrics> getMetrics(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(ac ->
            ac.describeCluster().flatMap(
                description -> Mono.just(
                        MetricsCollector.builder()
                            .clusterDescription(description)
                            .version(ac.getVersion())
                            .build()
                    )
                    .zipWith(jmxClusterUtil.getBrokerMetrics(cluster, description.getNodes()),
                        (b, jmx) -> b.toBuilder().jmxMetrics(jmx).build())
                    .zipWith(zookeeperService.getZkStatus(cluster),
                        (b, status) -> b.toBuilder().zkStatus(status).build()))
                    .zipWith(topicsService.getTopicsData(ac),
                        (b, td) -> b.toBuilder().topicsData(td).build())
                    .zipWith(getLogDirInfo(cluster, ac),
                        (b, ld) -> b.toBuilder().logDirResult(ld).build())
                .map(MetricsCollector::build)
        )
        .doOnError(e ->
            log.error("Failed to collect cluster {} info", cluster.getName(), e)
        ).onErrorResume(
            e -> Mono.just(cluster.getMetrics().toBuilder()
                .status(ServerStatusDTO.OFFLINE)
                .lastKafkaException(e)
                .build())
        );
  }

  @Builder(toBuilder = true)
  private static class MetricsCollector {
    String version;
    ClusterDescription clusterDescription;
    JmxMetrics jmxMetrics;
    List<InternalTopic> topicsData;
    ZkStatus zkStatus;
    Optional<LogDirInfo> logDirResult; // empty if log dir collection disabled

    InternalClusterMetrics build() {
      var metricsBuilder = InternalClusterMetrics.builder();
      metricsBuilder.version(version);
      metricsBuilder.status(ServerStatusDTO.ONLINE);
      metricsBuilder.lastKafkaException(null);

      metricsBuilder.zookeeperStatus(zkStatus.getStatus());
      metricsBuilder.zooKeeperStatus(ClusterUtil.convertToIntServerStatus(zkStatus.getStatus()));
      metricsBuilder.lastZookeeperException(zkStatus.getError());

      metricsBuilder.brokers(
          clusterDescription.getNodes().stream().map(Node::id).collect(toList()));
      metricsBuilder.brokerCount(clusterDescription.getNodes().size());
      metricsBuilder.activeControllers(clusterDescription.getController() != null ? 1 : 0);

      fillTopicsMetrics(metricsBuilder, topicsData);
      fillJmxMetrics(metricsBuilder, jmxMetrics);

      logDirResult.ifPresent(r -> r.enrichWithLogDirInfo(metricsBuilder));

      return metricsBuilder.build();
    }
  }

  private static void fillJmxMetrics(
      InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder,
      JmxMetrics jmxMetrics) {
    metricsBuilder.metrics(jmxMetrics.getMetrics());
    metricsBuilder.internalBrokerMetrics(jmxMetrics.getInternalBrokerMetrics());

    metricsBuilder.bytesInPerSec(
        jmxMetrics.getBytesInPerSec().values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add));

    metricsBuilder.bytesOutPerSec(
        jmxMetrics.getBytesOutPerSec().values().stream()
            .reduce(BigDecimal.ZERO, BigDecimal::add));

    metricsBuilder.topics(
        metricsBuilder.build().getTopics().values().stream()
            .map(t ->
                t.withIoRates(
                    jmxMetrics.getBytesInPerSec().get(t.getName()),
                    jmxMetrics.getBytesOutPerSec().get(t.getName()))
            ).collect(Collectors.toMap(InternalTopic::getName, t -> t))
    );
  }

  private Mono<Optional<LogDirInfo>> getLogDirInfo(KafkaCluster cluster, ReactiveAdminClient c) {
    if (cluster.getDisableLogDirsCollection() == null || !cluster.getDisableLogDirsCollection()) {
      return c.describeLogDirs().map(LogDirInfo::new).map(Optional::of);
    }
    return Mono.just(Optional.empty());
  }

  private static void fillTopicsMetrics(
      InternalClusterMetrics.InternalClusterMetricsBuilder builder,
      List<InternalTopic> topics) {

    int underReplicatedPartitions = 0;
    int inSyncReplicasCount = 0;
    int outOfSyncReplicasCount = 0;
    int onlinePartitionCount = 0;
    int offlinePartitionCount = 0;

    for (InternalTopic topic : topics) {
      underReplicatedPartitions += topic.getUnderReplicatedPartitions();
      inSyncReplicasCount += topic.getInSyncReplicas();
      outOfSyncReplicasCount += (topic.getReplicas() - topic.getInSyncReplicas());
      onlinePartitionCount +=
          topic.getPartitions().values().stream().mapToInt(s -> s.getLeader() == null ? 0 : 1)
              .sum();
      offlinePartitionCount +=
          topic.getPartitions().values().stream().mapToInt(s -> s.getLeader() != null ? 0 : 1)
              .sum();
    }

    builder
        .underReplicatedPartitionCount(underReplicatedPartitions)
        .inSyncReplicasCount(inSyncReplicasCount)
        .outOfSyncReplicasCount(outOfSyncReplicasCount)
        .onlinePartitionCount(onlinePartitionCount)
        .offlinePartitionCount(offlinePartitionCount)
        .topicCount(topics.size())
        .topics(topics.stream().collect(Collectors.toMap(InternalTopic::getName, t -> t)));
  }

  private static class LogDirInfo {

    private final Map<TopicPartition, LongSummaryStatistics> partitionsStats;
    private final Map<String, LongSummaryStatistics> topicStats;
    private final Map<Integer, LongSummaryStatistics> brokerStats;

    LogDirInfo(Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>> log) {
      final List<Tuple3<Integer, TopicPartition, Long>> topicPartitions =
          log.entrySet().stream().flatMap(b ->
              b.getValue().entrySet().stream().flatMap(topicMap ->
                  topicMap.getValue().replicaInfos.entrySet().stream()
                      .map(e -> Tuples.of(b.getKey(), e.getKey(), e.getValue().size))
              )
          ).collect(toList());

      partitionsStats = topicPartitions.stream().collect(
          groupingBy(
              Tuple2::getT2,
              summarizingLong(Tuple3::getT3)));

      topicStats =
          topicPartitions.stream().collect(
              groupingBy(
                  t -> t.getT2().topic(),
                  summarizingLong(Tuple3::getT3)));

      brokerStats = topicPartitions.stream().collect(
          groupingBy(
              Tuple2::getT1,
              summarizingLong(Tuple3::getT3)));
    }

    private InternalTopic enrichTopicWithSegmentStats(InternalTopic topic) {
      LongSummaryStatistics stats = topicStats.get(topic.getName());
      return topic.withSegmentStats(stats.getSum(), stats.getCount())
          .toBuilder()
          .partitions(
              topic.getPartitions().entrySet().stream().map(e ->
                  Tuples.of(e.getKey(),
                      enrichPartitionWithSegmentsData(topic.getName(), e.getValue()))
              ).collect(toMap(Tuple2::getT1, Tuple2::getT2))
          ).build();
    }

    private InternalPartition enrichPartitionWithSegmentsData(String topic,
                                                              InternalPartition partition) {
      final LongSummaryStatistics stats =
          partitionsStats.get(new TopicPartition(topic, partition.getPartition()));
      return partition.withSegmentStats(stats.getSum(), stats.getCount());
    }

    private Map<Integer, InternalBrokerDiskUsage> getBrokersDiskUsage() {
      return brokerStats.entrySet().stream().map(e ->
          Tuples.of(e.getKey(), InternalBrokerDiskUsage.builder()
              .segmentSize(e.getValue().getSum())
              .segmentCount(e.getValue().getCount())
              .build()
          )
      ).collect(toMap(Tuple2::getT1, Tuple2::getT2));
    }

    private Map<String, InternalTopic> enrichTopics(Map<String, InternalTopic> topics) {
      return topics.values().stream()
          .map(this::enrichTopicWithSegmentStats)
          .collect(Collectors.toMap(InternalTopic::getName, t -> t));
    }

    public void enrichWithLogDirInfo(
        InternalClusterMetrics.InternalClusterMetricsBuilder builder) {
      builder
          .topics(enrichTopics(builder.build().getTopics()))
          .internalBrokerDiskUsage(getBrokersDiskUsage());
    }
  }
}
