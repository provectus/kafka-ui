package com.provectus.kafka.ui.newserde.spi;

import java.util.Map;

public final class SchemaDescription {

  private final String jsonSchema;
  private final Map<String, Object> additionalProperties;

  public SchemaDescription(String jsonSchema, Map<String, Object> additionalProperties) {
    this.jsonSchema = jsonSchema;
    this.additionalProperties = additionalProperties;
  }

  public String getJsonSchema() {
    return jsonSchema;
  }

  public Map<String, Object> getAdditionalProperties() {
    return additionalProperties;
  }
}
