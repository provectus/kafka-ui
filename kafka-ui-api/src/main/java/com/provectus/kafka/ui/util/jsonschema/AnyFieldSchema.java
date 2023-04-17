package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// Specifies field that can contain any kind of value - primitive, complex and nulls
class AnyFieldSchema implements FieldSchema {

  static AnyFieldSchema get() {
    return new AnyFieldSchema();
  }

  private AnyFieldSchema() {
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    var arr = mapper.createArrayNode();
    arr.add("number");
    arr.add("string");
    arr.add("object");
    arr.add("array");
    arr.add("boolean");
    arr.add("null");
    return mapper.createObjectNode().set("type", arr);
  }
}
