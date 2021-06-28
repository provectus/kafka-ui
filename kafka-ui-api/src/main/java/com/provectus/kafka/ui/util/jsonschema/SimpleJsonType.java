package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import java.util.Map;

public class SimpleJsonType extends JsonType {

  public SimpleJsonType(Type type) {
    super(type);
  }

  @Override
  public Map<String, JsonNode> toJsonNode(ObjectMapper mapper) {
    return Map.of(
        "type",
        new TextNode(type.getName())
    );
  }
}
