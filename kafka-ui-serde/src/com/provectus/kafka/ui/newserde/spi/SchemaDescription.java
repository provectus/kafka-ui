package com.provectus.kafka.ui.newserde.spi;

public final class SchemaDescription {

  private final String jsonSchema;

  private SchemaDescription(String jsonSchema) {
    this.jsonSchema = jsonSchema;
  }

  public String getJsonSchema() {
    return jsonSchema;
  }
}
