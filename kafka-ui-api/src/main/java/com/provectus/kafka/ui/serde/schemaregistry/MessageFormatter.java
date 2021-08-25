package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;

public interface MessageFormatter {
  JsonNode format(String topic, byte[] value);

  default MessageFormat getFormat() {
    return MessageFormat.UNKNOWN;
  }
}
