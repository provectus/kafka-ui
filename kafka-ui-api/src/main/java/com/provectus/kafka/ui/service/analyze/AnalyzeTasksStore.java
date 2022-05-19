package com.provectus.kafka.ui.service.analyze;

import com.google.common.base.Throwables;
import com.provectus.kafka.ui.model.CompletedTopicAnalyzeDTO;
import com.provectus.kafka.ui.model.InProgressTopicAnalyzeDTO;
import com.provectus.kafka.ui.model.TopicAnalyzeStateDTO;
import java.io.Closeable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.SneakyThrows;
import lombok.Value;

class AnalyzeTasksStore {

  private final Map<TopicIdentity, RunningAnalyze> running = new ConcurrentHashMap<>();
  private final Map<TopicIdentity, CompletedTopicAnalyzeDTO> completed = new ConcurrentHashMap<>();

  void setAnalyzeError(TopicIdentity topicId,
                       Instant collectionStartedAt,
                       Throwable th) {
    running.remove(topicId);
    completed.put(
        topicId,
        new CompletedTopicAnalyzeDTO()
            .startedAt(collectionStartedAt.toEpochMilli())
            .finishedAt(System.currentTimeMillis())
            .error(Throwables.getStackTraceAsString(th))
    );
  }

  void setAnalyzeResult(TopicIdentity topicId,
                        Instant collectionStartedAt,
                        TopicAnalyzeStats totalStats,
                        Map<Integer, TopicAnalyzeStats> partitionStats) {
    running.remove(topicId);
    completed.put(topicId,
        new CompletedTopicAnalyzeDTO()
            .startedAt(collectionStartedAt.toEpochMilli())
            .finishedAt(System.currentTimeMillis())
            .totalStats(totalStats.toDto(null))
            .partitionStats(
                partitionStats.entrySet().stream()
                    .map(e -> e.getValue().toDto(e.getKey()))
                    .collect(Collectors.toList())
            ));
  }

  void updateProgress(TopicIdentity topicId,
                      long msgsScanned,
                      long bytesScanned,
                      Double completeness) {
    running.computeIfPresent(topicId, (k, state) ->
        state.toBuilder()
            .msgsScanned(msgsScanned)
            .bytesScanned(bytesScanned)
            .completenessPercent(completeness)
            .build());
  }

  void registerNewTask(TopicIdentity topicId, Closeable task) {
    running.put(topicId, new RunningAnalyze(Instant.now(), 0.0, 0, 0, task));
  }

  void cancelAnalyze(TopicIdentity topicId) {
    Optional.ofNullable(running.remove(topicId))
        .ifPresent(RunningAnalyze::stopTask);
  }

  boolean isAnalyzeInProgress(TopicIdentity id) {
    return running.containsKey(id);
  }

  Optional<TopicAnalyzeStateDTO> getTopicAnalyzeState(TopicIdentity id) {
    var runningState = running.get(id);
    var completedState = completed.get(id);
    if (runningState == null && completedState == null) {
      return Optional.empty();
    }
    return Optional.of(createAnalyzeStateDto(runningState, completedState));
  }

  private TopicAnalyzeStateDTO createAnalyzeStateDto(@Nullable RunningAnalyze runningState,
                                                     @Nullable CompletedTopicAnalyzeDTO completedState) {
    return new TopicAnalyzeStateDTO()
        .inProgress(runningState != null ? runningState.toDto() : null)
        .completed(completedState);
  }

  @Value
  @Builder(toBuilder = true)
  private static class RunningAnalyze {
    Instant startedAt;
    double completenessPercent;
    long msgsScanned;
    long bytesScanned;
    Closeable task;

    InProgressTopicAnalyzeDTO toDto() {
      return new InProgressTopicAnalyzeDTO()
          .startedAt(startedAt.toEpochMilli())
          .bytesScanned(bytesScanned)
          .msgsScanned(msgsScanned)
          .completenessPercent(BigDecimal.valueOf(completenessPercent));
    }

    @SneakyThrows
    void stopTask() {
      task.close();
    }
  }
}
