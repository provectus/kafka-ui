package com.provectus.kafka.ui.exception;

public class KsqlDbNotFoundException extends CustomBaseException {

  public KsqlDbNotFoundException() {
    super("KSQL DB not found");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.KSQLDB_NOT_FOUND;
  }
}
