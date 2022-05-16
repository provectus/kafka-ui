package com.provectus.kafka.ui.service.analyze;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicAnalyzeStateDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.TopicsService;
import com.provectus.kafka.ui.util.OffsetsSeek.WaitingOffsets;
import java.io.Closeable;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
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
                topic.getPartitions().values()
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
    if (analyzeTasksStore.isAnalyzeInProgress(topicId)) {
      throw new IllegalStateException("Topic is already analyzing");
    }
    var task = new AnalyzingTask(cluster, topicId, partitionsCnt, approxNumberOfMsgs);
    analyzeTasksStore.registerNewTask(topicId, task);
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

  class AnalyzingTask implements Runnable, Closeable {

    private final Instant startedAt = Instant.now();

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
          // to improve polling throughput
          Map.of(
              ConsumerConfig.RECEIVE_BUFFER_CONFIG, "-1", //let OS tune buffer size
              ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100000"
          )
      );
    }

    @Override
    public void close() {
      consumer.wakeup();
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
        analyzeTasksStore.setAnalyzeResult(topicId, startedAt, totalStats, partitionStats);
        log.info("{} topic analyze finished", topicId);
      } catch (WakeupException | InterruptException cancelException) {
        log.info("{} topic analyze stopped", topicId);
      } catch (Throwable th) {
        log.info("Error analyzing topic {}", topicId, th);
        analyzeTasksStore.setAnalyzeError(topicId, th);
      } finally {
        consumer.close();
      }
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
}
