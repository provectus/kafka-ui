package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.ConsumerPosition;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;

@Log4j2
public class OffsetsSeekForward extends OffsetsSeek {

  public OffsetsSeekForward(String topic, ConsumerPosition consumerPosition) {
    super(topic, consumerPosition);
  }

  protected void assignAndSeekForOffset(Consumer<Bytes, Bytes> consumer) {
    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    consumer.assign(partitions);
    consumerPosition.getSeekTo().forEach((partition, offset) -> {
      TopicPartition topicPartition = new TopicPartition(topic, partition);
      consumer.seek(topicPartition, offset);
    });
  }

  protected void assignAndSeekForTimestamp(Consumer<Bytes, Bytes> consumer) {
    Map<TopicPartition, Long> timestampsToSearch =
        consumerPosition.getSeekTo().entrySet().stream()
            .collect(Collectors.toMap(
                partitionPosition -> new TopicPartition(topic, partitionPosition.getKey()),
                Map.Entry::getValue
            ));
    Map<TopicPartition, Long> offsetsForTimestamps = consumer.offsetsForTimes(timestampsToSearch)
        .entrySet().stream()
        .filter(e -> e.getValue() != null)
        .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().offset()));

    if (offsetsForTimestamps.isEmpty()) {
      throw new IllegalArgumentException("No offsets were found for requested timestamps");
    }

    consumer.assign(offsetsForTimestamps.keySet());
    offsetsForTimestamps.forEach(consumer::seek);
  }

  protected void assignAndSeekFromBeginning(Consumer<Bytes, Bytes> consumer) {
    List<TopicPartition> partitions = getRequestedPartitions(consumer);
    consumer.assign(partitions);
    consumer.seekToBeginning(partitions);
  }

}
