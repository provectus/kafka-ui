package com.provectus.kafka.ui.serde.schemaregistry;

import java.util.Optional;

public enum MessageFormat {
  AVRO,
  JSON,
  PROTOBUF,
  UNKNOWN;

  public static Optional<MessageFormat> fromString(String typeString) {
    try {
      return Optional.of(MessageFormat.valueOf(typeString.toUpperCase()));
    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
