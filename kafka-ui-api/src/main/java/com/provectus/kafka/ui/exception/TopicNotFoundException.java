package com.provectus.kafka.ui.exception;

public class TopicNotFoundException extends CustomBaseException {

  public TopicNotFoundException() {
    super("Topic not found");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.TOPIC_NOT_FOUND;
  }
}
