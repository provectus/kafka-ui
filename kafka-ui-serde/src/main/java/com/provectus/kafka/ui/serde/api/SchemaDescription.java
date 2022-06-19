package com.provectus.kafka.ui.serde.api;

import java.util.Map;

public final class SchemaDescription {

  // can be json schema or plain text
  private final String schema;
  private final Map<String, Object> additionalProperties;

  public SchemaDescription(String schema, Map<String, Object> additionalProperties) {
    this.schema = schema;
    this.additionalProperties = additionalProperties;
  }

  public String getSchema() {
    return schema;
  }

  public Map<String, Object> getAdditionalProperties() {
    return additionalProperties;
  }
}
