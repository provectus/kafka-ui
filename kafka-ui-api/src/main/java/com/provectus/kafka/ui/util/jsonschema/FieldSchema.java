package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public interface FieldSchema {
  JsonNode toJsonNode(ObjectMapper mapper);
}
