package com.provectus.kafka.ui.exception;

public class TopicAnalysisException extends CustomBaseException {

  public TopicAnalysisException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.TOPIC_ANALYSIS_ERROR;
  }
}
