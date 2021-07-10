package com.provectus.kafka.ui.service;

import static com.google.common.base.Preconditions.checkArgument;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static org.apache.kafka.common.ConsumerGroupState.DEAD;
import static org.apache.kafka.common.ConsumerGroupState.EMPTY;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Collection;
import java.util.HashMap;
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

  public void resetToEarliest(KafkaCluster cluster, String group, String topic,
                              Collection<Integer> partitions) {
    checkGroupCondition(cluster, group);
    try (var consumer = getConsumer(cluster, group)) {
      var targetPartitions = getTargetPartitions(consumer, topic, partitions);
      var offsets = consumer.beginningOffsets(targetPartitions);
      commitOffsets(consumer, offsets);
    }
  }

  public void resetToLatest(KafkaCluster cluster, String group, String topic,
                            Collection<Integer> partitions) {
    checkGroupCondition(cluster, group);
    try (var consumer = getConsumer(cluster, group)) {
      var targetPartitions = getTargetPartitions(consumer, topic, partitions);
      var offsets = consumer.endOffsets(targetPartitions);
      commitOffsets(consumer, offsets);
    }
  }

  public void resetToTimestamp(KafkaCluster cluster, String group, String topic,
                               Collection<Integer> partitions, long targetTimestamp) {
    checkGroupCondition(cluster, group);
    try (var consumer = getConsumer(cluster, group)) {
      var targetPartitions = getTargetPartitions(consumer, topic, partitions);
      var offsets = offsetsByTimestamp(consumer, targetPartitions, targetTimestamp);
      commitOffsets(consumer, offsets);
    }
  }

  public void resetToOffsets(KafkaCluster cluster, String group, String topic,
                             Map<Integer, Long> targetOffsets) {
    checkGroupCondition(cluster, group);
    try (var consumer = getConsumer(cluster, group)) {
      var offsets = targetOffsets.entrySet().stream()
          .collect(toMap(e -> new TopicPartition(topic, e.getKey()), Map.Entry::getValue));
      offsets = editOffsetsIfNeeded(consumer, offsets);
      commitOffsets(consumer, offsets);
    }
  }

  private void checkGroupCondition(KafkaCluster cluster, String groupId) {
    InternalConsumerGroup description =
        kafkaService.getConsumerGroupsInternal(cluster)
            .blockOptional()
            .stream()
            .flatMap(Collection::stream)
            .filter(cgd -> cgd.getGroupId().equals(groupId))
            .findAny()
            .orElseThrow(() -> new NotFoundException("Consumer group not found"));

    if (!Set.of(DEAD, EMPTY).contains(description.getState())) {
      throw new ValidationException(
          String.format(
              "Group's offsets can be reset only if group is inactive, but group is in %s state",
              description.getState()));
    }
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
    foundOffsets.putAll(consumer.endOffsets(Sets.difference(partitions, foundOffsets.keySet())));
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

  private void commitOffsets(Consumer<?, ?> consumer, Map<TopicPartition, Long> offsets) {
    consumer.commitSync(
        offsets.entrySet().stream()
            .collect(toMap(Map.Entry::getKey, e -> new OffsetAndMetadata(e.getValue())))
    );
  }

  private Consumer<?, ?> getConsumer(KafkaCluster cluster, String groupId) {
    return kafkaService.createConsumer(cluster, Map.of(ConsumerConfig.GROUP_ID_CONFIG, groupId));
  }

}
