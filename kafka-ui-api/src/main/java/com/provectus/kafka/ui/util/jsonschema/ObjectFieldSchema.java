package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class ObjectFieldSchema implements FieldSchema {
  private final Map<String, FieldSchema> properties;
  private final List<String> required;
  private final boolean nullable;

  public ObjectFieldSchema(Map<String, FieldSchema> properties,
                           List<String> required) {
    this(properties, required, false);
  }

  public ObjectFieldSchema(Map<String, FieldSchema> properties,
                           List<String> required, boolean nullable) {
    this.properties = properties;
    this.required = required;
    this.nullable = nullable;
  }

  public Map<String, FieldSchema> getProperties() {
    return properties;
  }

  public List<String> getRequired() {
    return required;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    final Map<String, JsonNode> nodes = properties.entrySet().stream()
        .map(e -> Tuples.of(e.getKey(), e.getValue().toJsonNode(mapper)))
        .collect(Collectors.toMap(
            Tuple2::getT1,
            Tuple2::getT2
        ));
    final ObjectNode objectNode = mapper.createObjectNode();
    if (this.nullable) {
      objectNode.set(
          "type",
          mapper.createArrayNode()
              .add(JsonType.Type.OBJECT.getName())
              .add(JsonType.Type.NULL.getName())
      );
    } else {
      objectNode.setAll(
          new SimpleJsonType(JsonType.Type.OBJECT).toJsonNode(mapper)
      );
    }
    objectNode.set("properties", mapper.valueToTree(nodes));
    if (!required.isEmpty()) {
      objectNode.set("required", mapper.valueToTree(required));
    }
    return objectNode;
  }
}
