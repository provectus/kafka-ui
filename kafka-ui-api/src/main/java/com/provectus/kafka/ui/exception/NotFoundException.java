package com.provectus.kafka.ui.exception;

public class NotFoundException extends CustomBaseException {

  public NotFoundException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.NOT_FOUND;
  }
}
