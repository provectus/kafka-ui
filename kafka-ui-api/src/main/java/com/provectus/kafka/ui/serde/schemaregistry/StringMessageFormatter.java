package com.provectus.kafka.ui.serde.schemaregistry;

import java.util.Map;
import lombok.SneakyThrows;

public class StringMessageFormatter implements MessageFormatter {

  @Override
  @SneakyThrows
  public Object format(String topic, byte[] value) {
    if (value != null) {
      return new String(value, "UTF8");
    } else {
      return Map.of();
    }
  }
}
