package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.stream.Collectors;

class OneOfFieldSchema implements FieldSchema {
  private final List<FieldSchema> schemaList;

  OneOfFieldSchema(List<FieldSchema> schemaList) {
    this.schemaList = schemaList;
  }

  @Override
  public JsonNode toJsonNode(ObjectMapper mapper) {
    return mapper.createObjectNode()
        .set("oneOf",
            mapper.createArrayNode().addAll(
                schemaList.stream()
                    .map(s -> s.toJsonNode(mapper))
                    .collect(Collectors.toList())
            )
        );
  }
}
