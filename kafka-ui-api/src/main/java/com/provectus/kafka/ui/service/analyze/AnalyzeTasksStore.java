package com.provectus.kafka.ui.service.analyze;

import com.google.common.base.Throwables;
import com.google.common.collect.Sets;
import com.provectus.kafka.ui.model.CompletedTopicAnalyzeDTO;
import com.provectus.kafka.ui.model.InProgressTopicAnalyzeDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicAnalyzeStateDTO;
import com.provectus.kafka.ui.service.analyze.TopicAnalyzeService.TopicAnalyzeStats;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Value;

class AnalyzeTasksStore {

  private final Map<TopicIdentity, RunningAnalyze> running = new ConcurrentHashMap<>();
  private final Map<TopicIdentity, CompletedTopicAnalyzeDTO> completed = new ConcurrentHashMap<>();

  @Value
  @Builder(toBuilder = true)
  private static class RunningAnalyze {
    Instant startedAt;
    double completenessPercent;
    long msgsScanned;
    long bytesScanned;
    Runnable stopHook;

    InProgressTopicAnalyzeDTO toDto() {
      return new InProgressTopicAnalyzeDTO()
          .startedAt(startedAt.toEpochMilli())
          .bytesScanned(bytesScanned)
          .msgsScanned(msgsScanned)
          .completenessPercent(BigDecimal.valueOf(completenessPercent));
    }
  }

  void analyzeError(TopicIdentity topicId, Throwable th) {
    running.remove(topicId);
    completed.put(
        topicId,
        new CompletedTopicAnalyzeDTO()
            .finishedAt(System.currentTimeMillis())
            .error(Throwables.getStackTraceAsString(th))
    );
  }

  void setResult(TopicIdentity topicId,
                 TopicAnalyzeStats totalStats,
                 Map<Integer, TopicAnalyzeStats> partitionStats) {
    running.remove(topicId);
    completed.put(topicId,
        new CompletedTopicAnalyzeDTO()
            .finishedAt(System.currentTimeMillis())
            .totalStats(totalStats.toDto())
            .partitionStats(partitionStats.entrySet().stream()
                .map(e -> e.getValue().toDto().partition(e.getKey()))
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

  void registerNewAnalyze(TopicIdentity topicId, Runnable cancelHook) {
    running.put(topicId, new RunningAnalyze(Instant.now(), 0.0, 0, 0, cancelHook));
  }

  void cancelAnalyze(TopicIdentity topicId) {
    Optional.ofNullable(running.remove(topicId))
        .ifPresent(s -> s.stopHook.run());
  }

  boolean analyzeInProgress(TopicIdentity id) {
    return running.containsKey(id);
  }

  Optional<TopicAnalyzeStateDTO> getTopicAnalyzeState(TopicIdentity id) {
    var runningState = running.get(id);
    var completedState = completed.get(id);
    if (runningState == null && completedState == null) {
      return Optional.empty();
    }
    return Optional.of(createAnalyzeStateDto(id.topicName, runningState, completedState));
  }

  private TopicAnalyzeStateDTO createAnalyzeStateDto(String topic,
                                                     @Nullable RunningAnalyze runningState,
                                                     @Nullable CompletedTopicAnalyzeDTO completedState) {
    var result = new TopicAnalyzeStateDTO();
    result.setTopicName(topic);
    if (runningState != null) {
      result.setInProgress(runningState.toDto());
    }
    if (completedState != null) {
      result.setCompleted(completedState);
    }
    return result;
  }

  List<TopicAnalyzeStateDTO> getAllTopicAnalyzeStates(KafkaCluster cluster) {
    return Sets.union(running.keySet(), completed.keySet())
        .stream()
        .filter(topicId -> topicId.clusterName.equals(cluster.getName()))
        .map(this::getTopicAnalyzeState)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(Collectors.toList());
  }

}
