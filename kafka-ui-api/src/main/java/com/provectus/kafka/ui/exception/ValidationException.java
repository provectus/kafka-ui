package com.provectus.kafka.ui.exception;


public class ValidationException extends CustomBaseException {
  public ValidationException(String message) {
    super(message);
  }

  public ValidationException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.VALIDATION_FAIL;
  }
}
