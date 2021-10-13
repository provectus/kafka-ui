package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.InternalBrokerDiskUsage;
import com.provectus.kafka.ui.model.InternalBrokerMetrics;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalPartition;
import com.provectus.kafka.ui.model.InternalSegmentSizeDto;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.util.ClusterUtil;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import com.provectus.kafka.ui.util.JmxMetricsName;
import com.provectus.kafka.ui.util.JmxMetricsValueName;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
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
   * @param cluster to be updated
   * @return cluster with up-to-date metrics and topics structure
   */
  public Mono<KafkaCluster> updateClusterMetrics(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(
            ac -> ac.getClusterVersion().flatMap(
                version ->
                    getClusterMetrics(ac)
                        .flatMap(i -> fillJmxMetrics(i, cluster, ac))
                        .flatMap(clusterMetrics ->
                            topicsService.getTopicsData(ac).flatMap(it -> {
                                  if (cluster.getDisableLogDirsCollection() == null
                                      || !cluster.getDisableLogDirsCollection()) {
                                    return updateSegmentMetrics(ac, clusterMetrics, it
                                    );
                                  } else {
                                    return emptySegmentMetrics(clusterMetrics, it);
                                  }
                                }
                            ).map(segmentSizeDto -> buildFromData(cluster, version, segmentSizeDto))
                        )
            )
        ).flatMap(
            nc -> featureService.getAvailableFeatures(cluster).collectList()
                .map(f -> nc.toBuilder().features(f).build())
        ).doOnError(e ->
            log.error("Failed to collect cluster {} info", cluster.getName(), e)
        ).onErrorResume(
            e -> Mono.just(cluster.toBuilder()
                .status(ServerStatusDTO.OFFLINE)
                .lastKafkaException(e)
                .build())
        );
  }

  private KafkaCluster buildFromData(KafkaCluster currentCluster,
                                     String version,
                                     InternalSegmentSizeDto segmentSizeDto) {

    var topics = segmentSizeDto.getInternalTopicWithSegmentSize();
    var brokersMetrics = segmentSizeDto.getClusterMetricsWithSegmentSize();
    var brokersIds = new ArrayList<>(brokersMetrics.getInternalBrokerMetrics().keySet());

    InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder =
        brokersMetrics.toBuilder();

    InternalClusterMetrics topicsMetrics = collectTopicsMetrics(topics);

    ServerStatusDTO zookeeperStatus = ServerStatusDTO.OFFLINE;
    Throwable zookeeperException = null;
    try {
      zookeeperStatus = zookeeperService.isZookeeperOnline(currentCluster)
          ? ServerStatusDTO.ONLINE
          : ServerStatusDTO.OFFLINE;
    } catch (Throwable e) {
      zookeeperException = e;
    }

    InternalClusterMetrics clusterMetrics = metricsBuilder
        .activeControllers(brokersMetrics.getActiveControllers())
        .topicCount(topicsMetrics.getTopicCount())
        .brokerCount(brokersMetrics.getBrokerCount())
        .underReplicatedPartitionCount(topicsMetrics.getUnderReplicatedPartitionCount())
        .inSyncReplicasCount(topicsMetrics.getInSyncReplicasCount())
        .outOfSyncReplicasCount(topicsMetrics.getOutOfSyncReplicasCount())
        .onlinePartitionCount(topicsMetrics.getOnlinePartitionCount())
        .offlinePartitionCount(topicsMetrics.getOfflinePartitionCount())
        .zooKeeperStatus(ClusterUtil.convertToIntServerStatus(zookeeperStatus))
        .version(version)
        .build();

    return currentCluster.toBuilder()
        .version(version)
        .status(ServerStatusDTO.ONLINE)
        .zookeeperStatus(zookeeperStatus)
        .lastZookeeperException(zookeeperException)
        .lastKafkaException(null)
        .metrics(clusterMetrics)
        .topics(topics)
        .brokers(brokersIds)
        .build();
  }

  private InternalClusterMetrics collectTopicsMetrics(Map<String, InternalTopic> topics) {

    int underReplicatedPartitions = 0;
    int inSyncReplicasCount = 0;
    int outOfSyncReplicasCount = 0;
    int onlinePartitionCount = 0;
    int offlinePartitionCount = 0;

    for (InternalTopic topic : topics.values()) {
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

    return InternalClusterMetrics.builder()
        .underReplicatedPartitionCount(underReplicatedPartitions)
        .inSyncReplicasCount(inSyncReplicasCount)
        .outOfSyncReplicasCount(outOfSyncReplicasCount)
        .onlinePartitionCount(onlinePartitionCount)
        .offlinePartitionCount(offlinePartitionCount)
        .topicCount(topics.size())
        .build();
  }

  private Mono<InternalClusterMetrics> getClusterMetrics(ReactiveAdminClient client) {
    return client.describeCluster().map(desc ->
        InternalClusterMetrics.builder()
            .brokerCount(desc.getNodes().size())
            .activeControllers(desc.getController() != null ? 1 : 0)
            .build()
    );
  }

  private InternalTopic mergeWithStats(InternalTopic topic,
                                       Map<String, LongSummaryStatistics> topics,
                                       Map<TopicPartition, LongSummaryStatistics> partitions) {
    final LongSummaryStatistics stats = topics.get(topic.getName());

    return topic.toBuilder()
        .segmentSize(stats.getSum())
        .segmentCount(stats.getCount())
        .partitions(
            topic.getPartitions().entrySet().stream().map(e ->
                Tuples.of(e.getKey(), mergeWithStats(topic.getName(), e.getValue(), partitions))
            ).collect(Collectors.toMap(
                Tuple2::getT1,
                Tuple2::getT2
            ))
        ).build();
  }

  private InternalPartition mergeWithStats(String topic, InternalPartition partition,
                                           Map<TopicPartition, LongSummaryStatistics> partitions) {
    final LongSummaryStatistics stats =
        partitions.get(new TopicPartition(topic, partition.getPartition()));
    return partition.toBuilder()
        .segmentSize(stats.getSum())
        .segmentCount(stats.getCount())
        .build();
  }

  private Mono<InternalSegmentSizeDto> emptySegmentMetrics(InternalClusterMetrics clusterMetrics,
                                                            List<InternalTopic> internalTopics) {
    return Mono.just(
        InternalSegmentSizeDto.builder()
        .clusterMetricsWithSegmentSize(
            clusterMetrics.toBuilder()
                .segmentSize(0)
                .segmentCount(0)
                .internalBrokerDiskUsage(Collections.emptyMap())
                .build()
        )
        .internalTopicWithSegmentSize(
            internalTopics.stream().collect(
                Collectors.toMap(
                    InternalTopic::getName,
                    i -> i
                )
            )
        ).build()
    );
  }

  private Mono<InternalSegmentSizeDto> updateSegmentMetrics(ReactiveAdminClient ac,
                                                            InternalClusterMetrics clusterMetrics,
                                                            List<InternalTopic> internalTopics) {
    return ac.describeCluster().flatMap(
        clusterDescription ->
                ac.describeLogDirs().map(log -> {
                  final List<Tuple3<Integer, TopicPartition, Long>> topicPartitions =
                      log.entrySet().stream().flatMap(b ->
                          b.getValue().entrySet().stream().flatMap(topicMap ->
                              topicMap.getValue().replicaInfos.entrySet().stream()
                                  .map(e -> Tuples.of(b.getKey(), e.getKey(), e.getValue().size))
                          )
                      ).collect(Collectors.toList());

                  final Map<TopicPartition, LongSummaryStatistics> partitionStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              Tuple2::getT2,
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );

                  final Map<String, LongSummaryStatistics> topicStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              t -> t.getT2().topic(),
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );

                  final Map<Integer, LongSummaryStatistics> brokerStats =
                      topicPartitions.stream().collect(
                          Collectors.groupingBy(
                              Tuple2::getT1,
                              Collectors.summarizingLong(Tuple3::getT3)
                          )
                      );


                  final LongSummaryStatistics summary =
                      topicPartitions.stream().collect(Collectors.summarizingLong(Tuple3::getT3));


                  final Map<String, InternalTopic> resultTopics = internalTopics.stream().map(e ->
                      Tuples.of(e.getName(), mergeWithStats(e, topicStats, partitionStats))
                  ).collect(Collectors.toMap(
                      Tuple2::getT1,
                      Tuple2::getT2
                  ));

                  final Map<Integer, InternalBrokerDiskUsage> resultBrokers =
                      brokerStats.entrySet().stream().map(e ->
                          Tuples.of(e.getKey(), InternalBrokerDiskUsage.builder()
                              .segmentSize(e.getValue().getSum())
                              .segmentCount(e.getValue().getCount())
                              .build()
                          )
                      ).collect(Collectors.toMap(
                          Tuple2::getT1,
                          Tuple2::getT2
                      ));

                  return InternalSegmentSizeDto.builder()
                      .clusterMetricsWithSegmentSize(
                          clusterMetrics.toBuilder()
                              .segmentSize(summary.getSum())
                              .segmentCount(summary.getCount())
                              .internalBrokerDiskUsage(resultBrokers)
                              .build()
                      )
                      .internalTopicWithSegmentSize(resultTopics).build();
                })
    );
  }

  private List<MetricDTO> getJmxMetric(KafkaCluster cluster, Node node) {
    return Optional.of(cluster)
        .filter(c -> c.getJmxPort() != null)
        .filter(c -> c.getJmxPort() > 0)
        .map(c -> jmxClusterUtil.getJmxMetrics(node.host(), c.getJmxPort(), c.isJmxSsl(),
                c.getJmxUsername(), c.getJmxPassword()))
        .orElse(Collections.emptyList());
  }

  private Mono<InternalClusterMetrics> fillJmxMetrics(InternalClusterMetrics internalClusterMetrics,
                                                      KafkaCluster cluster,
                                                      ReactiveAdminClient ac) {
    return fillBrokerMetrics(internalClusterMetrics, cluster, ac)
        .map(this::calculateClusterMetrics);
  }

  private Mono<InternalClusterMetrics> fillBrokerMetrics(
      InternalClusterMetrics internalClusterMetrics, KafkaCluster cluster, ReactiveAdminClient ac) {
    return ac.describeCluster()
        .flatMapIterable(ReactiveAdminClient.ClusterDescription::getNodes)
        .map(broker ->
            Map.of(broker.id(), InternalBrokerMetrics.builder()
                .metrics(getJmxMetric(cluster, broker)).build())
        )
        .collectList()
        .map(s -> internalClusterMetrics.toBuilder()
            .internalBrokerMetrics(ClusterUtil.toSingleMap(s.stream())).build());
  }

  private InternalClusterMetrics calculateClusterMetrics(
      InternalClusterMetrics internalClusterMetrics) {
    final List<MetricDTO> metrics = internalClusterMetrics.getInternalBrokerMetrics().values()
        .stream()
        .flatMap(b -> b.getMetrics().stream())
        .collect(
            Collectors.groupingBy(
                MetricDTO::getCanonicalName,
                Collectors.reducing(jmxClusterUtil::reduceJmxMetrics)
            )
        ).values().stream()
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());
    final InternalClusterMetrics.InternalClusterMetricsBuilder metricsBuilder =
        internalClusterMetrics.toBuilder().metrics(metrics);
    metricsBuilder.bytesInPerSec(findTopicMetrics(
        metrics, JmxMetricsName.BytesInPerSec, JmxMetricsValueName.FiveMinuteRate
    ));
    metricsBuilder.bytesOutPerSec(findTopicMetrics(
        metrics, JmxMetricsName.BytesOutPerSec, JmxMetricsValueName.FiveMinuteRate
    ));
    return metricsBuilder.build();
  }

  private Map<String, BigDecimal> findTopicMetrics(List<MetricDTO> metrics,
                                                   JmxMetricsName metricsName,
                                                   JmxMetricsValueName valueName) {
    return metrics.stream().filter(m -> metricsName.name().equals(m.getName()))
        .filter(m -> m.getParams().containsKey("topic"))
        .filter(m -> m.getValue().containsKey(valueName.name()))
        .map(m -> Tuples.of(
            m.getParams().get("topic"),
            m.getValue().get(valueName.name())
        )).collect(Collectors.groupingBy(
            Tuple2::getT1,
            Collectors.reducing(BigDecimal.ZERO, Tuple2::getT2, BigDecimal::add)
        ));
  }
}
