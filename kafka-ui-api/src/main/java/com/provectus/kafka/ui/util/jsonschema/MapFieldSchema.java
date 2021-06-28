package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

public class MapFieldSchema implements FieldSchema {
  private final FieldSchema itemSchema;

  public MapFieldSchema(FieldSchema itemSchema) {
    this.itemSchema = itemSchema;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    final ObjectNode objectNode = mapper.createObjectNode();
    objectNode.set("type", new TextNode(JsonType.Type.OBJECT.getName()));
    objectNode.set("additionalProperties", itemSchema.toJsonNode(mapper));
    return objectNode;
  }
}
