package com.provectus.kafka.ui.exception;

public class TopicOrPartitionNotFoundException extends CustomBaseException {

  public TopicOrPartitionNotFoundException() {
    super("This server does not host this topic-partition.");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.TOPIC_OR_PARTITION_NOT_FOUND;
  }
}
