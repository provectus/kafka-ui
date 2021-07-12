package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;


public class EnumJsonType extends JsonType {
  private final List<String> values;

  public EnumJsonType(List<String> values) {
    super(Type.ENUM);
    this.values = values;
  }

  @Override
  public Map<String, JsonNode> toJsonNode(ObjectMapper mapper) {
    return Map.of(
        this.type.getName(),
        mapper.valueToTree(values)
    );
  }
}
