package com.provectus.kafka.ui.exception;

public class KsqlApiException extends CustomBaseException {

  public KsqlApiException(String message) {
    super(message);
  }

  public KsqlApiException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.KSQL_API_ERROR;
  }
}
