package com.provectus.kafka.ui.newserde.builtin.sr;

import java.util.Optional;
import org.apache.commons.lang3.EnumUtils;

public enum MessageFormat {
  AVRO,
  JSON,
  PROTOBUF,
  UNKNOWN;

  public static Optional<MessageFormat> fromString(String typeString) {
    return Optional.ofNullable(EnumUtils.getEnum(MessageFormat.class, typeString));
  }
}
