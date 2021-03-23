package com.provectus.kafka.ui.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends CustomBaseException {
  public ValidationException(String message) {
    super(message);
  }

  @Override
  public HttpStatus getResponseStatusCode() {
    return HttpStatus.BAD_REQUEST;
  }
}
