package com.provectus.kafka.ui.exception;

public class SchemaCompatibilityException extends CustomBaseException {
  public SchemaCompatibilityException() {
    super("Schema being registered is incompatible with an earlier schema");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.UNPROCESSABLE_ENTITY;
  }
}
