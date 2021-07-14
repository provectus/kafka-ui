package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SimpleFieldSchema implements FieldSchema {
  private final JsonType type;

  public SimpleFieldSchema(JsonType type) {
    this.type = type;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    return mapper.createObjectNode().setAll(type.toJsonNode(mapper));
  }
}
