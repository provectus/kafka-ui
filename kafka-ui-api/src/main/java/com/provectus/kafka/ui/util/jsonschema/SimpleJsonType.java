package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.google.common.collect.ImmutableMap;
import java.util.Map;

class SimpleJsonType extends JsonType {

  private final Map<String, JsonNode> additionalTypeProperties;

  SimpleJsonType(Type type) {
    this(type, Map.of());
  }

  SimpleJsonType(Type type, Map<String, JsonNode> additionalTypeProperties) {
    super(type);
    this.additionalTypeProperties = additionalTypeProperties;
  }

  @Override
  public Map<String, JsonNode> toJsonNode(ObjectMapper mapper) {
    return ImmutableMap.<String, JsonNode>builder()
        .put("type", new TextNode(type.getName()))
        .putAll(additionalTypeProperties)
        .build();
  }
}
