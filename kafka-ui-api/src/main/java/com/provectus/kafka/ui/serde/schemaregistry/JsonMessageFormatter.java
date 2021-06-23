package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import lombok.SneakyThrows;

public class JsonMessageFormatter implements MessageFormatter {
  private final ObjectMapper objectMapper;

  public JsonMessageFormatter(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  @SneakyThrows
  public Object format(String topic, byte[] value) {
    if (value == null) {
      return Map.of();
    }
    return parseJson(value);
  }

  private Object parseJson(byte[] bytes) throws IOException {
    return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
    });
  }
}
