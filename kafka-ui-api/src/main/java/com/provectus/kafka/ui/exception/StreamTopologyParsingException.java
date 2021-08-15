package com.provectus.kafka.ui.exception;

public class StreamTopologyParsingException extends CustomBaseException {
  public StreamTopologyParsingException() {
    super("Stream topology string is invalid");
  }

  public StreamTopologyParsingException(String message) {
    super(message);
  }

  public StreamTopologyParsingException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.INVALID_STREAM_TOPOLOGY_STRING;
  }
}
