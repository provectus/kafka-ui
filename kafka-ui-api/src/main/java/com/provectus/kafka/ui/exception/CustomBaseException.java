package com.provectus.kafka.ui.exception;


public abstract class CustomBaseException extends RuntimeException {
  protected CustomBaseException() {
    super();
  }

  protected CustomBaseException(String message) {
    super(message);
  }

  protected CustomBaseException(String message, Throwable cause) {
    super(message, cause);
  }

  protected CustomBaseException(Throwable cause) {
    super(cause);
  }

  protected CustomBaseException(String message, Throwable cause, boolean enableSuppression,
                                boolean writableStackTrace) {
    super(message, cause, enableSuppression, writableStackTrace);
  }

  public abstract ErrorCode getErrorCode();
}
