package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import java.util.List;
import java.util.Map;


class EnumJsonType extends JsonType {
  private final List<String> values;

  EnumJsonType(List<String> values) {
    super(Type.ENUM);
    this.values = values;
  }

  @Override
  public Map<String, JsonNode> toJsonNode(ObjectMapper mapper) {
    return Map.of(
        "type",
        new TextNode(Type.STRING.getName()),
        Type.ENUM.getName(),
        mapper.valueToTree(values)
    );
  }
}
