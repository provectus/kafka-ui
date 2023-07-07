package com.provectus.kafka.ui.model;

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summarizingLong;

import jakarta.annotation.Nullable;
import java.util.HashMap;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.concurrent.atomic.LongAdder;
import lombok.Value;
import org.apache.kafka.clients.admin.LogDirDescription;
import org.apache.kafka.common.TopicPartition;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

@Value
public class InternalLogDirStats {

  @Value
  public static class SegmentStats {
    Long segmentSize;
    Integer segmentsCount;

    private SegmentStats(LongSummaryStatistics s) {
      segmentSize = s.getSum();
      segmentsCount = (int) s.getCount();
    }
  }

  public record LogDirSpaceStats(@Nullable Long totalBytes,
                                 @Nullable Long usableBytes,
                                 Map<String, Long> totalPerDir,
                                 Map<String, Long> usablePerDir) {
  }

  Map<TopicPartition, SegmentStats> partitionsStats;
  Map<String, SegmentStats> topicStats;
  Map<Integer, SegmentStats> brokerStats;
  Map<Integer, LogDirSpaceStats> brokerDirsStats;

  public static InternalLogDirStats empty() {
    return new InternalLogDirStats(Map.of());
  }

  public InternalLogDirStats(Map<Integer, Map<String, LogDirDescription>> log) {
    final List<Tuple3<Integer, TopicPartition, Long>> topicPartitions =
        log.entrySet().stream().flatMap(b ->
            b.getValue().entrySet().stream().flatMap(topicMap ->
                topicMap.getValue().replicaInfos().entrySet().stream()
                    .map(e -> Tuples.of(b.getKey(), e.getKey(), e.getValue().size()))
            )
        ).toList();

    partitionsStats = topicPartitions.stream().collect(
        groupingBy(
            Tuple2::getT2,
            collectingAndThen(
                summarizingLong(Tuple3::getT3), SegmentStats::new)));

    topicStats =
        topicPartitions.stream().collect(
            groupingBy(
                t -> t.getT2().topic(),
                collectingAndThen(
                    summarizingLong(Tuple3::getT3), SegmentStats::new)));

    brokerStats = topicPartitions.stream().collect(
        groupingBy(
            Tuple2::getT1,
            collectingAndThen(
                summarizingLong(Tuple3::getT3), SegmentStats::new)));

    brokerDirsStats = calculateSpaceStats(log);
  }

  private static Map<Integer, LogDirSpaceStats> calculateSpaceStats(Map<Integer, Map<String, LogDirDescription>> log) {
    var stats = new HashMap<Integer, LogDirSpaceStats>();
    log.forEach((brokerId, logDirStats) -> {
      Map<String, Long> totalBytes = new HashMap<>();
      Map<String, Long> usableBytes = new HashMap<>();
      logDirStats.forEach((logDir, descr) -> {
        if (descr.error() == null) {
          return;
        }
        descr.totalBytes().ifPresent(b -> totalBytes.merge(logDir, b, Long::sum));
        descr.usableBytes().ifPresent(b -> usableBytes.merge(logDir, b, Long::sum));
      });
      stats.put(
          brokerId,
          new LogDirSpaceStats(
              totalBytes.isEmpty() ? null : totalBytes.values().stream().mapToLong(i -> i).sum(),
              usableBytes.isEmpty() ? null : usableBytes.values().stream().mapToLong(i -> i).sum(),
              totalBytes,
              usableBytes
          )
      );
    });
    return stats;
  }
}
