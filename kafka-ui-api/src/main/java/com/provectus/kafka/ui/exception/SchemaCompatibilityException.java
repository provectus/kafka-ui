package com.provectus.kafka.ui.exception;

public class SchemaCompatibilityException extends CustomBaseException {
  public SchemaCompatibilityException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.UNPROCESSABLE_ENTITY;
  }
}
