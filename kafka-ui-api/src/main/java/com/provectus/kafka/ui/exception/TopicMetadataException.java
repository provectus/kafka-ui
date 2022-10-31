package com.provectus.kafka.ui.exception;

public class TopicMetadataException extends CustomBaseException {

  public TopicMetadataException(String message) {
    super(message);
  }

  public TopicMetadataException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.INVALID_ENTITY_STATE;
  }
}
