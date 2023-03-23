package com.provectus.kafka.ui.service.analyze;

import com.provectus.kafka.ui.emitter.EmptyPollsCounter;
import com.provectus.kafka.ui.emitter.OffsetsInfo;
import com.provectus.kafka.ui.emitter.PollingSettings;
import com.provectus.kafka.ui.emitter.PollingThrottler;
import com.provectus.kafka.ui.exception.TopicAnalysisException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicAnalysisDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.TopicsService;
import java.io.Closeable;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
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
public class TopicAnalysisService {

  private final AnalysisTasksStore analysisTasksStore = new AnalysisTasksStore();

  private final TopicsService topicsService;
  private final ConsumerGroupService consumerGroupService;

  public Mono<Void> analyze(KafkaCluster cluster, String topicName) {
    return topicsService.getTopicDetails(cluster, topicName)
        .doOnNext(topic ->
            startAnalysis(
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

  private synchronized void startAnalysis(KafkaCluster cluster,
                                          String topic,
                                          int partitionsCnt,
                                          long approxNumberOfMsgs) {
    var topicId = new TopicIdentity(cluster, topic);
    if (analysisTasksStore.isAnalysisInProgress(topicId)) {
      throw new TopicAnalysisException("Topic is already analyzing");
    }
    var task = new AnalysisTask(cluster, topicId, partitionsCnt, approxNumberOfMsgs, cluster.getPollingSettings());
    analysisTasksStore.registerNewTask(topicId, task);
    Schedulers.boundedElastic().schedule(task);
  }

  public void cancelAnalysis(KafkaCluster cluster, String topicName) {
    analysisTasksStore.cancelAnalysis(new TopicIdentity(cluster, topicName));
  }

  public Optional<TopicAnalysisDTO> getTopicAnalysis(KafkaCluster cluster, String topicName) {
    return analysisTasksStore.getTopicAnalysis(new TopicIdentity(cluster, topicName));
  }

  class AnalysisTask implements Runnable, Closeable {

    private final Instant startedAt = Instant.now();

    private final TopicIdentity topicId;
    private final int partitionsCnt;
    private final long approxNumberOfMsgs;
    private final EmptyPollsCounter emptyPollsCounter;
    private final PollingThrottler throttler;

    private final TopicAnalysisStats totalStats = new TopicAnalysisStats();
    private final Map<Integer, TopicAnalysisStats> partitionStats = new HashMap<>();

    private final KafkaConsumer<Bytes, Bytes> consumer;

    AnalysisTask(KafkaCluster cluster, TopicIdentity topicId, int partitionsCnt,
                 long approxNumberOfMsgs, PollingSettings pollingSettings) {
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
      this.throttler = pollingSettings.getPollingThrottler();
      this.emptyPollsCounter = pollingSettings.createEmptyPollsCounter();
    }

    @Override
    public void close() {
      consumer.wakeup();
    }

    @Override
    public void run() {
      try {
        log.info("Starting {} topic analysis", topicId);
        var topicPartitions = IntStream.range(0, partitionsCnt)
            .peek(i -> partitionStats.put(i, new TopicAnalysisStats()))
            .mapToObj(i -> new TopicPartition(topicId.topicName, i))
            .collect(Collectors.toList());

        consumer.assign(topicPartitions);
        consumer.seekToBeginning(topicPartitions);

        var offsetsInfo = new OffsetsInfo(consumer, topicId.topicName);
        while (!offsetsInfo.assignedPartitionsFullyPolled() && !emptyPollsCounter.noDataEmptyPollsReached()) {
          var polled = consumer.poll(Duration.ofSeconds(3));
          throttler.throttleAfterPoll(polled);
          emptyPollsCounter.count(polled);
          polled.forEach(r -> {
            totalStats.apply(r);
            partitionStats.get(r.partition()).apply(r);
          });
          updateProgress();
        }
        analysisTasksStore.setAnalysisResult(topicId, startedAt, totalStats, partitionStats);
        log.info("{} topic analysis finished", topicId);
      } catch (WakeupException | InterruptException cancelException) {
        log.info("{} topic analysis stopped", topicId);
        // calling cancel for cases when our thread was interrupted by some non-user cancellation reason
        analysisTasksStore.cancelAnalysis(topicId);
      } catch (Throwable th) {
        log.error("Error analyzing topic {}", topicId, th);
        analysisTasksStore.setAnalysisError(topicId, startedAt, th);
      } finally {
        consumer.close();
      }
    }

    private void updateProgress() {
      if (totalStats.totalMsgs > 0 && approxNumberOfMsgs != 0) {
        analysisTasksStore.updateProgress(
            topicId,
            totalStats.totalMsgs,
            totalStats.keysSize.sum + totalStats.valuesSize.sum,
            Math.min(100.0, (((double) totalStats.totalMsgs) / approxNumberOfMsgs) * 100)
        );
      }
    }
  }
}
