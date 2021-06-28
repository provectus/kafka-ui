package com.provectus.kafka.ui.serde.schemaregistry;

public interface MessageFormatter {
  Object format(String topic, byte[] value);
}
