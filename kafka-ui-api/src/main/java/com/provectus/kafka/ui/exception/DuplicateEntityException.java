package com.provectus.kafka.ui.exception;

public class DuplicateEntityException extends CustomBaseException {

  public DuplicateEntityException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.DUPLICATED_ENTITY;
  }
}
