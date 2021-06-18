package com.provectus.kafka.ui.model;

import java.util.Map;
import lombok.Value;

@Value
public class ConsumerPosition {

  private SeekType seekType;
  private Map<Integer, Long> seekTo;
  private SeekDirection seekDirection;
}
