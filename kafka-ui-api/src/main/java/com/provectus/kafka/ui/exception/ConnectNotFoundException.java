package com.provectus.kafka.ui.exception;

public class ConnectNotFoundException extends CustomBaseException {

  public ConnectNotFoundException() {
    super("Connect not found");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.CONNECT_NOT_FOUND;
  }
}
