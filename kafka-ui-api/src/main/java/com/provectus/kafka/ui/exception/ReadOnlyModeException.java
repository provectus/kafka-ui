package com.provectus.kafka.ui.exception;


public class ReadOnlyModeException extends CustomBaseException {

  public ReadOnlyModeException() {
    super("This cluster is in read-only mode.");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.READ_ONLY_MODE_ENABLE;
  }
}
