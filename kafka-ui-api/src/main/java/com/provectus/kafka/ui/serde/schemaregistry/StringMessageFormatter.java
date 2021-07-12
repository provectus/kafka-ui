package com.provectus.kafka.ui.serde.schemaregistry;

import java.nio.charset.StandardCharsets;

public class StringMessageFormatter implements MessageFormatter {

  @Override
  public String format(String topic, byte[] value) {
    return new String(value, StandardCharsets.UTF_8);
  }
}
