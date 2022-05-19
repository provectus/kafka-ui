package com.provectus.kafka.ui.exception;

public class TopicAnalyzeException extends CustomBaseException {

  public TopicAnalyzeException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.TOPIC_ANALYZE_ERROR;
  }
}
