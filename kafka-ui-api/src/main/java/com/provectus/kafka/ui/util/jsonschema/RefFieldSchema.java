package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;

class RefFieldSchema implements FieldSchema {
  private final String ref;

  RefFieldSchema(String ref) {
    this.ref = ref;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    return mapper.createObjectNode().set("$ref", new TextNode(ref));
  }

  String getRef() {
    return ref;
  }
}
