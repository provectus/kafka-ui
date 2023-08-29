package com.provectus.kafka.ui.model;

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summarizingLong;
import static java.util.stream.Collectors.toList;

import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import lombok.Value;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuple3;
import reactor.util.function.Tuples;

@Value
public class InternalLogDirStats {

  @Value
  public static class SegmentStats {
    long segmentSize;
    int segmentsCount;

    public SegmentStats(LongSummaryStatistics s) {
      segmentSize = s.getSum();
      segmentsCount = (int) s.getCount();
    }
  }

  Map<TopicPartition, SegmentStats> partitionsStats;
  Map<String, SegmentStats> topicStats;
  Map<Integer, SegmentStats> brokerStats;

  public static InternalLogDirStats empty() {
    return new InternalLogDirStats(Map.of());
  }

  public InternalLogDirStats(Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>> log) {
    final List<Tuple3<Integer, TopicPartition, Long>> topicPartitions =
        log.entrySet().stream().flatMap(b ->
            b.getValue().entrySet().stream().flatMap(topicMap ->
                topicMap.getValue().replicaInfos.entrySet().stream()
                    .map(e -> Tuples.of(b.getKey(), e.getKey(), e.getValue().size))
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
  }
}
