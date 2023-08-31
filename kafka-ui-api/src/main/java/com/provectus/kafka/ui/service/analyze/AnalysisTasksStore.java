package com.provectus.kafka.ui.service.analyze;

import com.google.common.base.Throwables;
import com.provectus.kafka.ui.model.TopicAnalysisDTO;
import com.provectus.kafka.ui.model.TopicAnalysisProgressDTO;
import com.provectus.kafka.ui.model.TopicAnalysisResultDTO;
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

class AnalysisTasksStore {

  private final Map<TopicIdentity, RunningAnalysis> running = new ConcurrentHashMap<>();
  private final Map<TopicIdentity, TopicAnalysisResultDTO> completed = new ConcurrentHashMap<>();

  void setAnalysisError(TopicIdentity topicId,
                        Instant collectionStartedAt,
                        Throwable th) {
    running.remove(topicId);
    completed.put(
        topicId,
        new TopicAnalysisResultDTO()
            .startedAt(collectionStartedAt.toEpochMilli())
            .finishedAt(System.currentTimeMillis())
            .error(Throwables.getStackTraceAsString(th))
    );
  }

  void setAnalysisResult(TopicIdentity topicId,
                         Instant collectionStartedAt,
                         TopicAnalysisStats totalStats,
                         Map<Integer, TopicAnalysisStats> partitionStats) {
    running.remove(topicId);
    completed.put(topicId,
        new TopicAnalysisResultDTO()
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
    running.put(topicId, new RunningAnalysis(Instant.now(), 0.0, 0, 0, task));
  }

  void cancelAnalysis(TopicIdentity topicId) {
    Optional.ofNullable(running.remove(topicId))
        .ifPresent(RunningAnalysis::stopTask);
  }

  boolean isAnalysisInProgress(TopicIdentity id) {
    return running.containsKey(id);
  }

  Optional<TopicAnalysisDTO> getTopicAnalysis(TopicIdentity id) {
    var runningState = running.get(id);
    var completedState = completed.get(id);
    if (runningState == null && completedState == null) {
      return Optional.empty();
    }
    return Optional.of(createAnalysisDto(runningState, completedState));
  }

  private TopicAnalysisDTO createAnalysisDto(@Nullable RunningAnalysis runningState,
                                             @Nullable TopicAnalysisResultDTO completedState) {
    return new TopicAnalysisDTO()
        .progress(runningState != null ? runningState.toDto() : null)
        .result(completedState);
  }

  @Builder(toBuilder = true)
  private record RunningAnalysis(Instant startedAt,
                                 double completenessPercent,
                                 long msgsScanned,
                                 long bytesScanned,
                                 Closeable task) {

    TopicAnalysisProgressDTO toDto() {
      return new TopicAnalysisProgressDTO()
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
