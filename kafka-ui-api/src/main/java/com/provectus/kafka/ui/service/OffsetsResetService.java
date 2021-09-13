package com.provectus.kafka.ui.service;

import static com.google.common.base.Preconditions.checkArgument;
import static com.provectus.kafka.ui.util.ClusterUtil.toMono;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static org.apache.kafka.common.ConsumerGroupState.DEAD;
import static org.apache.kafka.common.ConsumerGroupState.EMPTY;

import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.clients.consumer.OffsetAndTimestamp;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Implementation follows https://cwiki.apache.org/confluence/display/KAFKA/KIP-122%3A+Add+Reset+Consumer+Group+Offsets+tooling
 * to works like "kafka-consumer-groups --reset-offsets" console command
 * (see kafka.admin.ConsumerGroupCommand)
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class OffsetsResetService {

  private final KafkaService kafkaService;
  private final AdminClientService adminClientService;

  public Mono<Map<TopicPartition, OffsetAndMetadata>> resetToEarliest(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions) {
    return checkGroupCondition(cluster, group)
        .flatMap(g -> {
          try (var consumer = getConsumer(cluster, group)) {
            var targetPartitions = getTargetPartitions(consumer, topic, partitions);
            var offsets = consumer.beginningOffsets(targetPartitions);
            return commitOffsets(consumer, offsets);
          }
        });
  }

  public Mono<Map<TopicPartition, OffsetAndMetadata>> resetToLatest(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions) {
    return checkGroupCondition(cluster, group).flatMap(
        g -> {
          try (var consumer = getConsumer(cluster, group)) {
            var targetPartitions = getTargetPartitions(consumer, topic, partitions);
            var offsets = consumer.endOffsets(targetPartitions);
            return commitOffsets(consumer, offsets);
          }
        }
    );
  }

  public Mono<Map<TopicPartition, OffsetAndMetadata>> resetToTimestamp(
      KafkaCluster cluster, String group, String topic, Collection<Integer> partitions,
      long targetTimestamp) {
    return checkGroupCondition(cluster, group).flatMap(
        g -> {
          try (var consumer = getConsumer(cluster, group)) {
            var targetPartitions = getTargetPartitions(consumer, topic, partitions);
            var offsets = offsetsByTimestamp(consumer, targetPartitions, targetTimestamp);
            return commitOffsets(consumer, offsets);
          }
        }
    );
  }

  public Mono<Map<TopicPartition, OffsetAndMetadata>> resetToOffsets(
      KafkaCluster cluster, String group, String topic, Map<Integer, Long> targetOffsets) {
    return checkGroupCondition(cluster, group).flatMap(
        g -> {
          try (var consumer = getConsumer(cluster, group)) {
            var offsets = targetOffsets.entrySet().stream()
                .collect(toMap(e -> new TopicPartition(topic, e.getKey()), Map.Entry::getValue));
            offsets = editOffsetsIfNeeded(consumer, offsets);
            return commitOffsets(consumer, offsets);
          }
        }
    );
  }

  private Mono<ConsumerGroupDescription> checkGroupCondition(KafkaCluster cluster, String groupId) {
    return adminClientService.getOrCreateAdminClient(cluster)
        .flatMap(ac ->
            // we need to call listConsumerGroups() to check group existence, because
            // describeConsumerGroups() will return consumer group even if it doesn't exist
            toMono(ac.getAdminClient().listConsumerGroups().all())
                .filter(cgs -> cgs.stream().anyMatch(g -> g.groupId().equals(groupId)))
                .flatMap(cgs -> toMono(
                    ac.getAdminClient().describeConsumerGroups(List.of(groupId)).all()))
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
                  return Mono.just(cg);
                })
                .switchIfEmpty(Mono.error(new NotFoundException("Consumer group not found")))
        );
  }

  private Map<TopicPartition, Long> offsetsByTimestamp(Consumer<?, ?> consumer,
                                                       Set<TopicPartition> partitions,
                                                       long timestamp) {
    Map<TopicPartition, OffsetAndTimestamp> timestampedOffsets = consumer
        .offsetsForTimes(partitions.stream().collect(toMap(p -> p, p -> timestamp)));

    var foundOffsets = timestampedOffsets.entrySet().stream()
        .filter(e -> e.getValue() != null)
        .collect(toMap(Map.Entry::getKey, e -> e.getValue().offset()));

    // for partitions where we didnt find offset by timestamp, we use end offsets
    Set<TopicPartition> endOffsets = new HashSet<>(partitions);
    endOffsets.removeAll(foundOffsets.keySet());
    foundOffsets.putAll(consumer.endOffsets(endOffsets));

    return foundOffsets;
  }

  private Set<TopicPartition> getTargetPartitions(Consumer<?, ?> consumer, String topic,
                                                  Collection<Integer> partitions) {
    var allPartitions = allTopicPartitions(consumer, topic);
    if (partitions == null || partitions.isEmpty()) {
      return allPartitions;
    } else {
      return partitions.stream()
          .map(idx -> new TopicPartition(topic, idx))
          .peek(tp -> checkArgument(allPartitions.contains(tp), "Invalid partition %s", tp))
          .collect(toSet());
    }
  }

  private Set<TopicPartition> allTopicPartitions(Consumer<?, ?> consumer, String topic) {
    return consumer.partitionsFor(topic).stream()
        .map(info -> new TopicPartition(topic, info.partition()))
        .collect(toSet());
  }

  /**
   * Checks if submitted offsets is between earliest and latest offsets. If case of range change
   * fail we reset offset to either earliest or latest offsets (To follow logic from
   * kafka.admin.ConsumerGroupCommand.scala)
   */
  private Map<TopicPartition, Long> editOffsetsIfNeeded(Consumer<?, ?> consumer,
                                                        Map<TopicPartition, Long> offsetsToCheck) {
    var earliestOffsets = consumer.beginningOffsets(offsetsToCheck.keySet());
    var latestOffsets = consumer.endOffsets(offsetsToCheck.keySet());
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

  private Mono<Map<TopicPartition, OffsetAndMetadata>> commitOffsets(
      Consumer<?, ?> consumer, Map<TopicPartition, Long> offsets
  ) {
    var toCommit = offsets.entrySet().stream()
        .collect(toMap(Map.Entry::getKey, e -> new OffsetAndMetadata(e.getValue())));
    consumer.commitSync(toCommit);
    return Mono.just(toCommit);
  }

  private Consumer<?, ?> getConsumer(KafkaCluster cluster, String groupId) {
    return kafkaService.createConsumer(cluster, Map.of(ConsumerConfig.GROUP_ID_CONFIG, groupId));
  }

}
