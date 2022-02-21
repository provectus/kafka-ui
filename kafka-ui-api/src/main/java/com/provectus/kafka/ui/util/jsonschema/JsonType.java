package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public abstract class JsonType {

  protected final Type type;

  protected JsonType(Type type) {
    this.type = type;
  }

  public Type getType() {
    return type;
  }

  public abstract Map<String, JsonNode> toJsonNode(ObjectMapper mapper);

  public enum Type {
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
