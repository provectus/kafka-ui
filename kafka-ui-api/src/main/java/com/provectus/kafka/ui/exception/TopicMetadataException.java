package com.provectus.kafka.ui.exception;

public class TopicMetadataException extends CustomBaseException {

  public TopicMetadataException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.INVALID_ENTITY_STATE;
  }
}
