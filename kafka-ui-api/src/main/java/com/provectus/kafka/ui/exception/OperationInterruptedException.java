package com.provectus.kafka.ui.exception;

public class OperationInterruptedException extends CustomBaseException {
  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.UNEXPECTED;
  }
}
