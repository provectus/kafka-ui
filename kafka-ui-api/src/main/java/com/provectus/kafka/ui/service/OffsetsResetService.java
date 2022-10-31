package com.provectus.kafka.ui.service;

import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static org.apache.kafka.common.ConsumerGroupState.DEAD;
import static org.apache.kafka.common.ConsumerGroupState.EMPTY;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Implementation follows https://cwiki.apache.org/confluence/display/KAFKA/KIP-122%3A+Add+Reset+Consumer+Group+Offsets+tooling
 * to works like "kafka-consumer-groups --reset-offsets" console command
 * (see kafka.admin.ConsumerGroupCommand)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OffsetsResetService {

  private final AdminClientService adminClientService;

  public Mono<Void> resetToEarliest(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions) {
    return checkGroupCondition(cluster, group)
        .flatMap(ac ->
            offsets(ac, topic, partitions, OffsetSpec.earliest())
                .flatMap(offsets -> resetOffsets(ac, group, offsets)));
  }

  private Mono<Map<TopicPartition, Long>> offsets(ReactiveAdminClient client,
                                                  String topic,
                                                  @Nullable Collection<Integer> partitions,
                                                  OffsetSpec spec) {
    if (partitions == null) {
      return client.listTopicOffsets(topic, spec, true);
    }
    return client.listOffsets(
        partitions.stream().map(idx -> new TopicPartition(topic, idx)).collect(toSet()),
        spec,
        true
    );
  }

  public Mono<Void> resetToLatest(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions) {
    return checkGroupCondition(cluster, group)
        .flatMap(ac ->
            offsets(ac, topic, partitions, OffsetSpec.latest())
                .flatMap(offsets -> resetOffsets(ac, group, offsets)));
  }

  public Mono<Void> resetToTimestamp(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions,
      long targetTimestamp) {
    return checkGroupCondition(cluster, group)
        .flatMap(ac ->
            offsets(ac, topic, partitions, OffsetSpec.forTimestamp(targetTimestamp))
                .flatMap(
                    foundOffsets -> offsets(ac, topic, partitions, OffsetSpec.latest())
                        .map(endOffsets -> editTsOffsets(foundOffsets, endOffsets))
                )
                .flatMap(offsets -> resetOffsets(ac, group, offsets))
        );
  }

  public Mono<Void> resetToOffsets(
      KafkaCluster cluster, String group, String topic, Map<Integer, Long> targetOffsets) {
    Preconditions.checkNotNull(targetOffsets);
    var partitionOffsets = targetOffsets.entrySet().stream()
        .collect(toMap(e -> new TopicPartition(topic, e.getKey()), Map.Entry::getValue));
    return checkGroupCondition(cluster, group).flatMap(
        ac ->
            ac.listOffsets(partitionOffsets.keySet(), OffsetSpec.earliest(), true)
                .flatMap(earliest ->
                    ac.listOffsets(partitionOffsets.keySet(), OffsetSpec.latest(), true)
                        .map(latest -> editOffsetsBounds(partitionOffsets, earliest, latest))
                        .flatMap(offsetsToCommit -> resetOffsets(ac, group, offsetsToCommit)))
    );
  }

  private Mono<ReactiveAdminClient> checkGroupCondition(KafkaCluster cluster, String groupId) {
    return adminClientService.get(cluster)
        .flatMap(ac ->
            // we need to call listConsumerGroups() to check group existence, because
            // describeConsumerGroups() will return consumer group even if it doesn't exist
            ac.listConsumerGroups()
                .filter(cgs -> cgs.stream().anyMatch(g -> g.equals(groupId)))
                .flatMap(cgs -> ac.describeConsumerGroups(List.of(groupId)))
                .filter(cgs -> cgs.containsKey(groupId))
                .map(cgs -> cgs.get(groupId))
                .flatMap(cg -> {
                  if (!Set.of(DEAD, EMPTY).contains(cg.state())) {
                    return Mono.error(
                        new ValidationException(
                            String.format(
                                "Group's offsets can be reset only if group is inactive,"
                                    + " but group is in %s state",
                                cg.state()
                            )
                        )
                    );
                  }
                  return Mono.just(ac);
                })
                .switchIfEmpty(Mono.error(new NotFoundException("Consumer group not found")))
        );
  }

  private Map<TopicPartition, Long> editTsOffsets(Map<TopicPartition, Long> foundTsOffsets,
                                                  Map<TopicPartition, Long> endOffsets) {
    // for partitions where we didnt find offset by timestamp, we use end offsets
    Map<TopicPartition, Long> result = new HashMap<>(endOffsets);
    result.putAll(foundTsOffsets);
    return result;
  }

  /**
   * Checks if submitted offsets is between earliest and latest offsets. If case of range change
   * fail we reset offset to either earliest or latest offsets (To follow logic from
   * kafka.admin.ConsumerGroupCommand.scala)
   */
  private Map<TopicPartition, Long> editOffsetsBounds(Map<TopicPartition, Long> offsetsToCheck,
                                                      Map<TopicPartition, Long> earliestOffsets,
                                                      Map<TopicPartition, Long> latestOffsets) {
    var result = new HashMap<TopicPartition, Long>();
    offsetsToCheck.forEach((tp, offset) -> {
      if (earliestOffsets.get(tp) > offset) {
        log.warn("Offset for partition {} is lower than earliest offset, resetting to earliest",
            tp);
        result.put(tp, earliestOffsets.get(tp));
      } else if (latestOffsets.get(tp) < offset) {
        log.warn("Offset for partition {} is greater than latest offset, resetting to latest", tp);
        result.put(tp, latestOffsets.get(tp));
      } else {
        result.put(tp, offset);
      }
    });
    return result;
  }

  private Mono<Void> resetOffsets(ReactiveAdminClient adminClient,
                                  String groupId,
                                  Map<TopicPartition, Long> offsets) {
    return adminClient.alterConsumerGroupOffsets(groupId, offsets);
  }

}
