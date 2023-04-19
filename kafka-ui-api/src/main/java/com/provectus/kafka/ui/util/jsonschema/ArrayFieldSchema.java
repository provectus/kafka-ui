package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

class ArrayFieldSchema implements FieldSchema {
  private final FieldSchema itemsSchema;

  ArrayFieldSchema(FieldSchema itemsSchema) {
    this.itemsSchema = itemsSchema;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    final ObjectNode objectNode = mapper.createObjectNode();
    objectNode.setAll(new SimpleJsonType(JsonType.Type.ARRAY).toJsonNode(mapper));
    objectNode.set("items", itemsSchema.toJsonNode(mapper));
    return objectNode;
  }
}
