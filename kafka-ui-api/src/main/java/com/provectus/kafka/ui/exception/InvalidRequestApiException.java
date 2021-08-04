package com.provectus.kafka.ui.exception;

public class InvalidRequestApiException extends CustomBaseException {

  public InvalidRequestApiException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.INVALID_REQUEST;
  }
}
