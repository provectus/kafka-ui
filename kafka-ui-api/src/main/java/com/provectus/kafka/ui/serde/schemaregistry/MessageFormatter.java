package com.provectus.kafka.ui.serde.schemaregistry;

public interface MessageFormatter {
  String format(String topic, byte[] value);

  default MessageFormat getFormat() {
    return MessageFormat.UNKNOWN;
  }
}
