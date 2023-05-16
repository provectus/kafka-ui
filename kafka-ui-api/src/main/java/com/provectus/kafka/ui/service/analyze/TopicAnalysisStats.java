package com.provectus.kafka.ui.service.analyze;

import com.provectus.kafka.ui.model.TopicAnalysisSizeStatsDTO;
import com.provectus.kafka.ui.model.TopicAnalysisStatsDTO;
import com.provectus.kafka.ui.model.TopicAnalysisStatsHourlyMsgCountsInnerDTO;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.apache.datasketches.hll.HllSketch;
import org.apache.datasketches.quantiles.DoublesSketch;
import org.apache.datasketches.quantiles.UpdateDoublesSketch;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

class TopicAnalysisStats {

  Long totalMsgs = 0L;
  Long minOffset;
  Long maxOffset;

  Long minTimestamp;
  Long maxTimestamp;

  long nullKeys = 0L;
  long nullValues = 0L;

  final SizeStats keysSize = new SizeStats();
  final SizeStats valuesSize = new SizeStats();

  final HllSketch uniqKeys = new HllSketch();
  final HllSketch uniqValues = new HllSketch();

  final HourlyCounts hourlyCounts = new HourlyCounts();

  static class SizeStats {
    long sum = 0;
    Long min;
    Long max;
    final UpdateDoublesSketch sizeSketch = DoublesSketch.builder().build();

    void apply(int len) {
      sum += len;
      min = minNullable(min, len);
      max = maxNullable(max, len);
      sizeSketch.update(len);
    }

    TopicAnalysisSizeStatsDTO toDto() {
      return new TopicAnalysisSizeStatsDTO()
          .sum(sum)
          .min(min)
          .max(max)
          .avg((long) (((double) sum) / sizeSketch.getN()))
          .prctl50((long) sizeSketch.getQuantile(0.5))
          .prctl75((long) sizeSketch.getQuantile(0.75))
          .prctl95((long) sizeSketch.getQuantile(0.95))
          .prctl99((long) sizeSketch.getQuantile(0.99))
          .prctl999((long) sizeSketch.getQuantile(0.999));
    }
  }

  static class HourlyCounts {

    // hour start ms -> count
    private final Map<Long, Long> hourlyStats = new HashMap<>();
    private final long minTs = Instant.now().minus(Duration.ofDays(14)).toEpochMilli();

    void apply(ConsumerRecord<?, ?> rec) {
      if (rec.timestamp() > minTs) {
        var hourStart = rec.timestamp() - rec.timestamp() % (1_000 * 60 * 60);
        hourlyStats.compute(hourStart, (h, cnt) -> cnt == null ? 1 : cnt + 1);
      }
    }

    List<TopicAnalysisStatsHourlyMsgCountsInnerDTO> toDto() {
      return hourlyStats.entrySet().stream()
          .sorted(Comparator.comparingLong(Map.Entry::getKey))
          .map(e -> new TopicAnalysisStatsHourlyMsgCountsInnerDTO()
              .hourStart(e.getKey())
              .count(e.getValue()))
          .collect(Collectors.toList());
    }
  }

  void apply(ConsumerRecord<Bytes, Bytes> rec) {
    totalMsgs++;
    minTimestamp = minNullable(minTimestamp, rec.timestamp());
    maxTimestamp = maxNullable(maxTimestamp, rec.timestamp());
    minOffset = minNullable(minOffset, rec.offset());
    maxOffset = maxNullable(maxOffset, rec.offset());
    hourlyCounts.apply(rec);

    if (rec.key() != null) {
      byte[] keyBytes = rec.key().get();
      keysSize.apply(rec.serializedKeySize());
      uniqKeys.update(keyBytes);
    } else {
      nullKeys++;
    }

    if (rec.value() != null) {
      byte[] valueBytes = rec.value().get();
      valuesSize.apply(rec.serializedValueSize());
      uniqValues.update(valueBytes);
    } else {
      nullValues++;
    }
  }

  TopicAnalysisStatsDTO toDto(@Nullable Integer partition) {
    return new TopicAnalysisStatsDTO()
        .partition(partition)
        .totalMsgs(totalMsgs)
        .minOffset(minOffset)
        .maxOffset(maxOffset)
        .minTimestamp(minTimestamp)
        .maxTimestamp(maxTimestamp)
        .nullKeys(nullKeys)
        .nullValues(nullValues)
        // because of hll error estimated size can be greater that actual msgs count
        .approxUniqKeys(Math.min(totalMsgs, (long) uniqKeys.getEstimate()))
        .approxUniqValues(Math.min(totalMsgs, (long) uniqValues.getEstimate()))
        .keySize(keysSize.toDto())
        .valueSize(valuesSize.toDto())
        .hourlyMsgCounts(hourlyCounts.toDto());
  }

  private static Long maxNullable(@Nullable Long v1, long v2) {
    return v1 == null ? v2 : Math.max(v1, v2);
  }

  private static Long minNullable(@Nullable Long v1, long v2) {
    return v1 == null ? v2 : Math.min(v1, v2);
  }
}
