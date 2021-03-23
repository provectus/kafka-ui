package com.provectus.kafka.ui.exception;

public class SchemaNotFoundException extends CustomBaseException {

  public SchemaNotFoundException() {
    super("Schema not found");
  }

  public SchemaNotFoundException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.SCHEMA_NOT_FOUND;
  }
}
