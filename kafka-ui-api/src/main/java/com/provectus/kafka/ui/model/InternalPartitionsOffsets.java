package com.provectus.kafka.ui.model;

import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Value;
import org.apache.kafka.common.TopicPartition;


public class InternalPartitionsOffsets {

  @Value
  public static class Offsets {
    Long earliest;
    Long latest;
  }

  private final Table<String, Integer, Offsets> offsets = HashBasedTable.create();

  public InternalPartitionsOffsets(Map<TopicPartition, Offsets> offsetsMap) {
    offsetsMap.forEach((tp, o) -> this.offsets.put(tp.topic(), tp.partition(), o));
  }

  public static InternalPartitionsOffsets empty() {
    return new InternalPartitionsOffsets(Map.of());
  }

  public Optional<Offsets> get(String topic, int partition) {
    return Optional.ofNullable(offsets.get(topic, partition));
  }

  public Map<Integer, Long> topicOffsets(String topic, boolean earliest) {
    return offsets.row(topic)
        .entrySet()
        .stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> earliest ? e.getValue().earliest : e.getValue().getLatest()));
  }

}
