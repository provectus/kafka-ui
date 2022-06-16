package com.provectus.kafka.ui.exception;

public class SchemaTypeNotSupportedException extends UnprocessableEntityException {

  private static final String REQUIRED_SCHEMA_REGISTRY_VERSION = "5.5.0";

  public SchemaTypeNotSupportedException() {
    super(String.format("Current version of Schema Registry does "
        + "not support provided schema type,"
        + " version %s or later is required here.", REQUIRED_SCHEMA_REGISTRY_VERSION));
  }
}
