package com.provectus.kafka.ui.exception;

public class TopicRecreationException extends CustomBaseException {
  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.RECREATE_TOPIC_TIMEOUT;
  }

  public TopicRecreationException(String topicName, int seconds) {
    super(String.format("Can't create topic '%s' in %d seconds: "
        + "topic deletion is still in progress", topicName, seconds));
  }
}
