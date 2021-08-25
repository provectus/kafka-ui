package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.SneakyThrows;

public class StringMessageFormatter implements MessageFormatter {
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  @SneakyThrows
  public JsonNode format(String topic, byte[] value) {
    return new TextNode(value.toString());
  }
}
