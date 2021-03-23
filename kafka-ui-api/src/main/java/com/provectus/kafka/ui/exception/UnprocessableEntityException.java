package com.provectus.kafka.ui.exception;


public class UnprocessableEntityException extends CustomBaseException {

  public UnprocessableEntityException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.UNPROCESSABLE_ENTITY;
  }
}
