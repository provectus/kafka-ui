package com.provectus.kafka.ui.service.analyze;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicAnalyzeSizeStatsDTO;
import com.provectus.kafka.ui.model.TopicAnalyzeStateDTO;
import com.provectus.kafka.ui.model.TopicAnalyzeStatsDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.TopicsService;
import com.provectus.kafka.ui.util.OffsetsSeek.WaitingOffsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.datasketches.hll.HllSketch;
import org.apache.datasketches.quantiles.DoublesSketch;
import org.apache.datasketches.quantiles.UpdateDoublesSketch;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Slf4j
@Component
@RequiredArgsConstructor
public class TopicAnalyzeService {

  private final AnalyzeTasksStore analyzeTasksStore = new AnalyzeTasksStore();

  private final TopicsService topicsService;
  private final ConsumerGroupService consumerGroupService;

  public Mono<Void> analyze(KafkaCluster cluster, String topicName) {
    return topicsService.getTopicDetails(cluster, topicName)
        .doOnNext(topic ->
            startAnalyze(
                cluster,
                topicName,
                topic.getPartitionCount(),
                topic.getPartitions()
                    .stream()
                    .mapToLong(p -> p.getOffsetMax() - p.getOffsetMin())
                    .sum()
            )
        ).then();
  }

  private synchronized void startAnalyze(KafkaCluster cluster,
                                         String topic,
                                         int partitionsCnt,
                                         long approxNumberOfMsgs) {
    var topicId = new TopicIdentity(cluster, topic);
    if (analyzeTasksStore.analyzeInProgress(topicId)) {
      throw new IllegalStateException("Topic is already analyzing");
    }
    var task = new AnalyzingTask(cluster, topicId, partitionsCnt, approxNumberOfMsgs);
    analyzeTasksStore.registerNewAnalyze(topicId, task.cancelHook());
    Schedulers.boundedElastic().schedule(task);
  }

  public void cancelAnalyze(KafkaCluster cluster, String topicName) {
    analyzeTasksStore.cancelAnalyze(new TopicIdentity(cluster, topicName));
  }

  public Optional<TopicAnalyzeStateDTO> getTopicAnalyzeState(KafkaCluster cluster, String topicName) {
    return analyzeTasksStore.getTopicAnalyzeState(new TopicIdentity(cluster, topicName));
  }

  public List<TopicAnalyzeStateDTO> getAllTopicAnalyzeStates(KafkaCluster cluster) {
    return analyzeTasksStore.getAllTopicAnalyzeStates(cluster);
  }

  class AnalyzingTask implements Runnable {

    private final TopicIdentity topicId;
    private final int partitionsCnt;
    private final long approxNumberOfMsgs;

    private final TopicAnalyzeStats totalStats = new TopicAnalyzeStats();
    private final Map<Integer, TopicAnalyzeStats> partitionStats = new HashMap<>();

    private final KafkaConsumer<Bytes, Bytes> consumer;

    AnalyzingTask(KafkaCluster cluster, TopicIdentity topicId, int partitionsCnt, long approxNumberOfMsgs) {
      this.topicId = topicId;
      this.approxNumberOfMsgs = approxNumberOfMsgs;
      this.partitionsCnt = partitionsCnt;
      this.consumer = consumerGroupService.createConsumer(
          cluster,
          Map.of(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100000")// for polling speed improve
      );
    }

    Runnable cancelHook() {
      return consumer::wakeup;
    }

    @Override
    public void run() {
      try {
        log.info("Starting {} topic analyze", topicId);
        var topicPartitions = IntStream.range(0, partitionsCnt)
            .peek(i -> partitionStats.put(i, new TopicAnalyzeStats()))
            .mapToObj(i -> new TopicPartition(topicId.topicName, i))
            .collect(Collectors.toList());

        consumer.assign(topicPartitions);
        consumer.seekToBeginning(topicPartitions);

        var waitingOffsets = new WaitingOffsets(topicId.topicName, consumer, topicPartitions);
        for (int emptyPolls = 0; !waitingOffsets.endReached() && emptyPolls < 3; ) {
          var polled = consumer.poll(Duration.ofSeconds(3));
          emptyPolls = polled.isEmpty() ? emptyPolls + 1 : 0;
          polled.forEach(r -> {
            totalStats.apply(r);
            partitionStats.get(r.partition()).apply(r);
            waitingOffsets.markPolled(r);
          });
          updateProgress();
        }
        reportResult();
        log.info("{} topic analyze finished", topicId);
      } catch (WakeupException | InterruptException cancelException) {
        log.info("{} topic analyze stopped", topicId);
      } catch (Throwable th) {
        log.info("Error analyzing topic {}", topicId, th);
        reportError(th);
      } finally {
        consumer.close();
      }
    }

    private void reportError(Throwable th) {
      analyzeTasksStore.analyzeError(topicId, th);
    }

    private void reportResult() {
      analyzeTasksStore.setResult(topicId, totalStats, partitionStats);
    }

    private void updateProgress() {
      if (totalStats.totalMsgs > 0 && approxNumberOfMsgs != 0) {
        analyzeTasksStore.updateProgress(
            topicId,
            totalStats.totalMsgs,
            totalStats.keysSize.sum + totalStats.valuesSize.sum,
            Math.min(100.0, (((double) totalStats.totalMsgs) / approxNumberOfMsgs) * 100)
        );
      }
    }
  }

  //-----------------------------------------------

  static class TopicAnalyzeStats {

    Long totalMsgs = 0L;
    Long minOffset;
    Long maxOffset;

    Long minTimestamp;
    Long maxTimestamp;

    long nullKeys = 0L;
    long nullValues = 0L;

    final SizeStats keysSize = new SizeStats();
    final SizeStats valuesSize = new SizeStats();

    final UniqCounter uniqKeys = new UniqCounter();
    final UniqCounter uniqValues = new UniqCounter();

    static class SizeStats {
      long sum = 0;
      Long min;
      Long max;
      final UpdateDoublesSketch sizeSketch = DoublesSketch.builder().build();

      void apply(byte[] bytes) {
        int len = bytes.length;
        sum += len;
        min = minNullable(min, len);
        max = maxNullable(max, len);
        sizeSketch.update(len);
      }

      TopicAnalyzeSizeStatsDTO toDto() {
        return new TopicAnalyzeSizeStatsDTO()
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

    static class UniqCounter {

      final HllSketch hll = new HllSketch();

      void apply(byte[] bytes) {
        hll.update(bytes);
      }

      long uniqCnt() {
        return (long) hll.getEstimate();
      }
    }

    void apply(ConsumerRecord<Bytes, Bytes> rec) {
      totalMsgs++;
      minTimestamp = minNullable(minTimestamp, rec.timestamp());
      maxTimestamp = maxNullable(maxTimestamp, rec.timestamp());
      minOffset = minNullable(minOffset, rec.offset());
      maxOffset = maxNullable(maxOffset, rec.offset());

      if (rec.key() != null) {
        byte[] keyBytes = rec.key().get();
        keysSize.apply(keyBytes);
        uniqKeys.apply(keyBytes);
      } else {
        nullKeys++;
      }

      if (rec.value() != null) {
        byte[] valueBytes = rec.value().get();
        valuesSize.apply(valueBytes);
        uniqValues.apply(valueBytes);
      } else {
        nullValues++;
      }
    }

    TopicAnalyzeStatsDTO toDto() {
      return new TopicAnalyzeStatsDTO()
          .totalMsgs(totalMsgs)
          .minOffset(minOffset)
          .maxOffset(maxOffset)
          .minTimestamp(minTimestamp)
          .maxTimestamp(maxTimestamp)
          .nullKeys(nullKeys)
          .nullValues(nullValues)
          .approxUniqKeys(uniqKeys.uniqCnt())
          .approxUniqValues(uniqValues.uniqCnt())
          .keySize(keysSize.toDto())
          .valueSize(valuesSize.toDto());
    }

    private static Long maxNullable(@Nullable Long v1, long v2) {
      return v1 == null ? v2 : Math.max(v1, v2);
    }

    private static Long minNullable(@Nullable Long v1, long v2) {
      return v1 == null ? v2 : Math.min(v1, v2);
    }
  }
}
