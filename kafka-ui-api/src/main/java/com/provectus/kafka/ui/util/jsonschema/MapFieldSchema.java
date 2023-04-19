package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import javax.annotation.Nullable;

class MapFieldSchema implements FieldSchema {
  private final @Nullable FieldSchema itemSchema;

  MapFieldSchema(@Nullable FieldSchema itemSchema) {
    this.itemSchema = itemSchema;
  }

  MapFieldSchema() {
    this(null);
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    final ObjectNode objectNode = mapper.createObjectNode();
    objectNode.set("type", new TextNode(JsonType.Type.OBJECT.getName()));
    objectNode.set("additionalProperties", itemSchema != null ? itemSchema.toJsonNode(mapper) : BooleanNode.TRUE);
    return objectNode;
  }
}
