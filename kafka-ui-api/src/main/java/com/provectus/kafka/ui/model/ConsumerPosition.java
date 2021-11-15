package com.provectus.kafka.ui.model;

import java.util.Map;
import lombok.Value;
import org.apache.kafka.common.TopicPartition;

@Value
public class ConsumerPosition {
  SeekTypeDTO seekType;
  Map<TopicPartition, Long> seekTo;
  SeekDirectionDTO seekDirection;
}
