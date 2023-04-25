package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

abstract class JsonType {

  protected final Type type;

  protected JsonType(Type type) {
    this.type = type;
  }

  Type getType() {
    return type;
  }

  abstract Map<String, JsonNode> toJsonNode(ObjectMapper mapper);

  enum Type {
    NULL,
    BOOLEAN,
    OBJECT,
    ARRAY,
    NUMBER,
    INTEGER,
    ENUM,
    STRING;

    private final String name;

    Type() {
      this.name = this.name().toLowerCase();
    }

    public String getName() {
      return name;
    }
  }
}
