package com.provectus.kafka.ui.service.metrics.scrape.inferred;

import static com.provectus.kafka.ui.model.InternalLogDirStats.LogDirSpaceStats;
import static com.provectus.kafka.ui.model.InternalLogDirStats.SegmentStats;
import static com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState.ConsumerGroupState;
import static com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState.NodeState;
import static com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState.TopicState;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.MemberAssignment;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.TopicPartitionInfo;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class InferredMetricsScraperTest {

  final InferredMetricsScraper scraper = new InferredMetricsScraper();

  @Test
  void allExpectedMetricsScraped() {
    var segmentStats = new SegmentStats(1234L, 3);
    var logDirStats = new LogDirSpaceStats(234L, 345L, Map.of(), Map.of());

    Node node1 = new Node(1, "node1", 9092);
    Node node2 = new Node(2, "node2", 9092);

    Mono<InferredMetrics> scraped = scraper.scrape(
        ScrapedClusterState.builder()
            .scrapeFinishedAt(Instant.now())
            .nodesStates(
                Map.of(
                    1, new NodeState(1, node1, segmentStats, logDirStats),
                    2, new NodeState(2, node2, segmentStats, logDirStats)
                )
            )
            .topicStates(
                Map.of(
                    "t1",
                    new TopicState(
                        "t1",
                        new TopicDescription(
                            "t1",
                            false,
                            List.of(
                                new TopicPartitionInfo(0, node1, List.of(node1, node2), List.of(node1, node2)),
                                new TopicPartitionInfo(1, node1, List.of(node1, node2), List.of(node1))
                            )
                        ),
                        List.of(),
                        Map.of(0, 100L, 1, 101L),
                        Map.of(0, 200L, 1, 201L),
                        segmentStats,
                        Map.of(0, segmentStats, 1, segmentStats)
                    )
                )
            )
            .consumerGroupsStates(
                Map.of(
                    "cg1",
                    new ConsumerGroupState(
                        "cg1",
                        new ConsumerGroupDescription(
                            "cg1",
                            true,
                            List.of(
                                new MemberDescription(
                                    "memb1", Optional.empty(), "client1", "hst1",
                                    new MemberAssignment(Set.of(new TopicPartition("t1", 0)))
                                )
                            ),
                            null,
                            org.apache.kafka.common.ConsumerGroupState.STABLE,
                            node1
                        ),
                        Map.of(new TopicPartition("t1", 0), 150L)
                    )
                )
            )
            .build()
    );

    StepVerifier.create(scraped)
        .assertNext(inferredMetrics ->
            assertThat(inferredMetrics.asStream().map(m -> m.name)).containsExactlyInAnyOrder(
                "broker_count",
                "broker_bytes_disk",
                "broker_bytes_usable",
                "broker_bytes_total",
                "topic_count",
                "kafka_topic_partitions",
                "kafka_topic_partition_current_offset",
                "kafka_topic_partition_oldest_offset",
                "kafka_topic_partition_in_sync_replica",
                "kafka_topic_partition_replicas",
                "kafka_topic_partition_leader",
                "topic_bytes_disk",
                "group_count",
                "group_state",
                "group_member_count",
                "group_host_count",
                "kafka_consumergroup_current_offset",
                "kafka_consumergroup_lag"
            )
        )
        .verifyComplete();
  }

}
