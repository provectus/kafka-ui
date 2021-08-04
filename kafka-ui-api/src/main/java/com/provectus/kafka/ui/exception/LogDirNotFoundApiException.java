package com.provectus.kafka.ui.exception;

public class LogDirNotFoundApiException extends CustomBaseException {

  public LogDirNotFoundApiException() {
    super("The user-specified log directory is not found in the broker config.");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.DIR_NOT_FOUND;
  }
}
