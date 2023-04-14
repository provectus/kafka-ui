package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;

@Getter
@Slf4j
public class PartitionDistributionStats {

  // avg skew will show unuseful results on low number of partitions
  private static final int MIN_PARTITIONS_FOR_SKEW_CALCULATION = 50;

  private static final MathContext ROUNDING_MATH_CTX = new MathContext(3);

  private final Map<Node, Integer> partitionLeaders;
  private final Map<Node, Integer> partitionsCount;
  private final Map<Node, Integer> inSyncPartitions;
  private final double avgPartitionsPerBroker;
  private final boolean skewCanBeCalculated;

  public static PartitionDistributionStats create(Statistics stats) {
    return create(stats, MIN_PARTITIONS_FOR_SKEW_CALCULATION);
  }

  public PartitionDistributionStats(Map<Node, Integer> partitionLeaders, Map<Node, Integer> partitionsCount,
                                    Map<Node, Integer> inSyncPartitions, double avgPartitionsPerBroker,
                                    boolean skewCanBeCalculated) {
    this.partitionLeaders = partitionLeaders;
    this.partitionsCount = partitionsCount;
    this.inSyncPartitions = inSyncPartitions;
    this.avgPartitionsPerBroker = avgPartitionsPerBroker;
    this.skewCanBeCalculated = skewCanBeCalculated;

    log.info("partitionLeaders : " + partitionLeaders);
    log.info("partitionsCount : " + partitionsCount);
    log.info("inSyncPartitions : " + inSyncPartitions);
    log.info("avgPartitionsPerBroker : " + avgPartitionsPerBroker);
    log.info("----");
  }

  static PartitionDistributionStats create(Statistics stats, int minPartitionsForSkewCalculation) {
    var partitionLeaders = new HashMap<Node, Integer>();
    var partitionsReplicated = new HashMap<Node, Integer>();
    var isr = new HashMap<Node, Integer>();
    for (TopicDescription td : stats.getTopicDescriptions().values()) {
      for (TopicPartitionInfo tp : td.partitions()) {
        tp.replicas().forEach(r -> incr(partitionsReplicated, r));
        tp.isr().forEach(r -> incr(isr, r));
        if (tp.leader() != null) {
          incr(partitionLeaders, tp.leader());
        }
      }
    }
    int nodesCount = partitionsReplicated.keySet().size();
    int partitionsCnt = partitionsReplicated.values().stream().mapToInt(i -> i).sum();
    double avgPartitionsPerBroker = nodesCount == 0 ? 0 : ((double) partitionsCnt) / nodesCount;
    log.info("Fixed nodes count : " + nodesCount);
    log.info("Fixed partitions count : " + partitionsCnt);
    return new PartitionDistributionStats(
        partitionLeaders,
        partitionsReplicated,
        isr,
        avgPartitionsPerBroker,
        partitionsCnt >= minPartitionsForSkewCalculation
    );
  }

  private static void incr(Map<Node, Integer> map, Node n) {
    map.compute(n, (k, c) -> c == null ? 1 : ++c);
  }

  @Nullable
  public BigDecimal partitionsSkew(Node node) {
    return calculateAvgSkew(partitionsCount.get(node), avgPartitionsPerBroker);
  }

  @Nullable
  public BigDecimal leadersSkew(Node node) {
    return calculateAvgSkew(partitionLeaders.get(node), avgPartitionsPerBroker);
  }

  // Returns difference (in percents) from average value, null if it can't be calculated
  @Nullable
  private BigDecimal calculateAvgSkew(@Nullable Integer value, double avgValue) {
    if (avgValue == 0 || !skewCanBeCalculated) {
      return null;
    }
    value = value == null ? 0 : value;
    return new BigDecimal((value - avgValue) / avgValue * 100.0).round(ROUNDING_MATH_CTX);
  }
}
