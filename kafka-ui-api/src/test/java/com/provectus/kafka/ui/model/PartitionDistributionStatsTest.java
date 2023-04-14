package com.provectus.kafka.ui.model;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.assertj.core.data.Percentage;
import org.junit.jupiter.api.Test;

class PartitionDistributionStatsTest {

  @Test
  void skewCalculatedBasedOnPartitionsCounts() {
    Node n1 = new Node(1, "n1", 9092);
    Node n2 = new Node(2, "n2", 9092);
    Node n3 = new Node(3, "n3", 9092);
    Node n4 = new Node(4, "n4", 9092);

    var stats = PartitionDistributionStats.create(
        Statistics.builder()
            .clusterDescription(
                new ReactiveAdminClient.ClusterDescription(null, "test", Set.of(n1, n2, n3), null))
            .topicDescriptions(
                Map.of(
                    "t1", new TopicDescription(
                        "t1", false,
                        List.of(
                            new TopicPartitionInfo(0, n1, List.of(n1, n2), List.of(n1, n2)),
                            new TopicPartitionInfo(1, n2, List.of(n2, n3), List.of(n2, n3))
                        )
                    ),
                    "t2", new TopicDescription(
                        "t2", false,
                        List.of(
                            new TopicPartitionInfo(0, n1, List.of(n1, n2), List.of(n1, n2)),
                            new TopicPartitionInfo(1, null, List.of(n2, n1), List.of(n1))
                        )
                    )
                )
            )
            .build(), 4
    );

    assertThat(stats.getPartitionLeaders())
        .containsExactlyInAnyOrderEntriesOf(Map.of(n1, 2, n2, 1));
    assertThat(stats.getPartitionsCount())
        .containsExactlyInAnyOrderEntriesOf(Map.of(n1, 3, n2, 4, n3, 1));
    assertThat(stats.getInSyncPartitions())
        .containsExactlyInAnyOrderEntriesOf(Map.of(n1, 3, n2, 3, n3, 1));

    // Node(partitions): n1(3), n2(4), n3(1), n4(0)
    // average partitions cnt = (3+4+1) / 3 = 2.666 (counting only nodes with partitions!)
    assertThat(stats.getAvgPartitionsPerBroker())
        .isCloseTo(2.666, Percentage.withPercentage(1));

    assertThat(stats.partitionsSkew(n1))
        .isCloseTo(BigDecimal.valueOf(12.5), Percentage.withPercentage(1));
    assertThat(stats.partitionsSkew(n2))
        .isCloseTo(BigDecimal.valueOf(50), Percentage.withPercentage(1));
    assertThat(stats.partitionsSkew(n3))
        .isCloseTo(BigDecimal.valueOf(-62.5), Percentage.withPercentage(1));
    assertThat(stats.partitionsSkew(n4))
        .isCloseTo(BigDecimal.valueOf(-100), Percentage.withPercentage(1));

    //  Node(leaders): n1(2), n2(1), n3(0), n4(0)
    //  average leaders cnt = (2+1) / 2 = 1.5 (counting only nodes with leaders!)
    assertThat(stats.leadersSkew(n1))
        .isCloseTo(BigDecimal.valueOf(33.33), Percentage.withPercentage(1));
    assertThat(stats.leadersSkew(n2))
        .isCloseTo(BigDecimal.valueOf(-33.33), Percentage.withPercentage(1));
    assertThat(stats.leadersSkew(n3))
        .isCloseTo(BigDecimal.valueOf(-100), Percentage.withPercentage(1));
    assertThat(stats.leadersSkew(n4))
        .isCloseTo(BigDecimal.valueOf(-100), Percentage.withPercentage(1));
  }

}
