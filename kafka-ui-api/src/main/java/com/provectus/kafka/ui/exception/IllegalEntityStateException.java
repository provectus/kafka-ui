package com.provectus.kafka.ui.exception;

public class IllegalEntityStateException extends CustomBaseException {
  public IllegalEntityStateException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.INVALID_ENTITY_STATE;
  }
}
