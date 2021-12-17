package com.provectus.kafka.ui.exception;

public class SchemaTypeIsNotSupportedException extends UnprocessableEntityException {

  public SchemaTypeIsNotSupportedException() {
    super("Current version of Schema Registry does not support provided schema type");
  }
}
