package com.provectus.kafka.ui.service.metrics.scrape.inferred;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState;
import io.prometheus.client.Collector.MetricFamilySamples;
import io.prometheus.client.GaugeMetricFamily;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
public class InferredMetricsScraper {

  private ScrapedClusterState prevState = null;

  public synchronized Mono<InferredMetrics> scrape(ScrapedClusterState newState) {
    var inferred = infer(prevState, newState);
    this.prevState = newState;
    return Mono.just(inferred);
  }

  @VisibleForTesting
  static InferredMetrics infer(@Nullable ScrapedClusterState prevState, ScrapedClusterState newState) {
    var registry = new MetricsRegistry();
    fillNodesMetrics(registry, newState);
    fillTopicMetrics(registry, newState);
    fillConsumerGroupsMetrics(registry, newState);
    List<MetricFamilySamples> metrics = registry.metrics.values().stream().toList();
    log.debug("{} metric families inferred from cluster state", metrics.size());
    return new InferredMetrics(metrics);
  }

  private static class MetricsRegistry {

    final Map<String, MetricFamilySamples> metrics = new LinkedHashMap<>();

    void gauge(String name,
               String help,
               List<String> lbls,
               List<String> lblVals,
               Number value) {
      GaugeMetricFamily gauge;
      if ((gauge = (GaugeMetricFamily) metrics.get(name)) == null) {
        gauge = new GaugeMetricFamily(name, help, lbls);
        metrics.put(name, gauge);
      }
      gauge.addMetric(lblVals, value.doubleValue());
    }
  }

  private static void fillNodesMetrics(MetricsRegistry registry, ScrapedClusterState newState) {
    registry.gauge(
        "broker_count",
        "Number of brokers in the Kafka cluster",
        List.of(),
        List.of(),
        newState.getNodesStates().size()
    );

    newState.getNodesStates().forEach((nodeId, state) -> {
      if (state.segmentStats() != null) {
        registry.gauge(
            "broker_bytes_disk",
            "Written disk size in bytes of a broker",
            List.of("node_id"),
            List.of(nodeId.toString()),
            state.segmentStats().getSegmentSize()
        );
      }
      if (state.logDirSpaceStats() != null) {
        if (state.logDirSpaceStats().usableBytes() != null) {
          registry.gauge(
              "broker_bytes_usable",
              "Usable disk size in bytes of a broker",
              List.of("node_id"),
              List.of(nodeId.toString()),
              state.logDirSpaceStats().usableBytes()
          );
        }
        if (state.logDirSpaceStats().totalBytes() != null) {
          registry.gauge(
              "broker_bytes_total",
              "Total disk size in bytes of a broker",
              List.of("node_id"),
              List.of(nodeId.toString()),
              state.logDirSpaceStats().totalBytes()
          );
        }
      }
    });
  }

  private static void fillTopicMetrics(MetricsRegistry registry, ScrapedClusterState clusterState) {
    registry.gauge(
        "topic_count",
        "Number of topics in the Kafka cluster",
        List.of(),
        List.of(),
        clusterState.getTopicStates().size()
    );

    clusterState.getTopicStates().forEach((topicName, state) -> {
      registry.gauge(
          "kafka_topic_partitions",
          "Number of partitions for this Topic",
          List.of("topic"),
          List.of(topicName),
          state.description().partitions().size()
      );
      state.endOffsets().forEach((partition, endOffset) -> {
        registry.gauge(
            "kafka_topic_partition_current_offset",
            "Current Offset of a Broker at Topic/Partition",
            List.of("topic", "partition"),
            List.of(topicName, String.valueOf(partition)),
            endOffset
        );
      });
      state.startOffsets().forEach((partition, startOffset) -> {
        registry.gauge(
            "kafka_topic_partition_oldest_offset",
            "Oldest Offset of a Broker at Topic/Partition",
            List.of("topic", "partition"),
            List.of(topicName, String.valueOf(partition)),
            startOffset
        );
      });
      state.description().partitions().forEach(p -> {
        registry.gauge(
            "kafka_topic_partition_in_sync_replica",
            "Number of In-Sync Replicas for this Topic/Partition",
            List.of("topic", "partition"),
            List.of(topicName, String.valueOf(p.partition())),
            p.isr().size()
        );
        registry.gauge(
            "kafka_topic_partition_replicas",
            "Number of Replicas for this Topic/Partition",
            List.of("topic", "partition"),
            List.of(topicName, String.valueOf(p.partition())),
            p.replicas().size()
        );
        registry.gauge(
            "kafka_topic_partition_leader",
            "Leader Broker ID of this Topic/Partition (-1, if no leader)",
            List.of("topic", "partition"),
            List.of(topicName, String.valueOf(p.partition())),
            Optional.ofNullable(p.leader()).map(Node::id).orElse(-1)
        );
      });
      if (state.segmentStats() != null) {
        registry.gauge(
            "topic_bytes_disk",
            "Disk size in bytes of a topic",
            List.of("topic"),
            List.of(topicName),
            state.segmentStats().getSegmentSize()
        );
      }
    });
  }

  private static void fillConsumerGroupsMetrics(MetricsRegistry registry, ScrapedClusterState clusterState) {
    registry.gauge(
        "group_count",
        "Number of consumer groups in the Kafka cluster",
        List.of(),
        List.of(),
        clusterState.getConsumerGroupsStates().size()
    );

    clusterState.getConsumerGroupsStates().forEach((groupName, state) -> {
      registry.gauge(
          "group_state",
          "State of the consumer group, value = ordinal of org.apache.kafka.common.ConsumerGroupState",
          List.of("group"),
          List.of(groupName),
          state.description().state().ordinal()
      );
      registry.gauge(
          "group_member_count",
          "Number of member assignments in the consumer group.",
          List.of("group"),
          List.of(groupName),
          state.description().members().size()
      );
      registry.gauge(
          "group_host_count",
          "Number of distinct hosts in the consumer group.",
          List.of("group"),
          List.of(groupName),
          state.description().members().stream().map(MemberDescription::host).distinct().count()
      );

      state.committedOffsets().forEach((tp, committedOffset) -> {
        registry.gauge(
            "kafka_consumergroup_current_offset",
            "Current Offset of a ConsumerGroup at Topic/Partition",
            List.of("consumergroup", "topic", "partition"),
            List.of(groupName, tp.topic(), String.valueOf(tp.partition())),
            committedOffset
        );

        Optional.ofNullable(clusterState.getTopicStates().get(tp.topic()))
            .flatMap(s -> Optional.ofNullable(s.endOffsets().get(tp.partition())))
            .ifPresent(endOffset ->
                registry.gauge(
                    "kafka_consumergroup_lag",
                    "Current Approximate Lag of a ConsumerGroup at Topic/Partition",
                    List.of("consumergroup", "topic", "partition"),
                    List.of(groupName, tp.topic(), String.valueOf(tp.partition())),
                    endOffset - committedOffset //TODO: check +-1
                ));

      });
    });
  }
}
