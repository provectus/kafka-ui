package com.provectus.kafka.ui.exception;

public class KafkaUiRuntimeException extends RuntimeException {
  public KafkaUiRuntimeException(String message, Throwable cause) {
    super(message, cause);
  }

  public KafkaUiRuntimeException(String message) {
    super(message);
  }
}
