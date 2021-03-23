package com.provectus.kafka.ui.exception;

import java.util.HashSet;
import org.apache.logging.log4j.LogManager;
import org.springframework.http.HttpStatus;


public enum ErrorCode {

  UNEXPECTED(5000, HttpStatus.INTERNAL_SERVER_ERROR),
  BINDING_FAIL(4001, HttpStatus.BAD_REQUEST),
  VALIDATION_FAIL(4002, HttpStatus.BAD_REQUEST),
  READ_ONLY_MODE_ENABLE(4003, HttpStatus.METHOD_NOT_ALLOWED),
  REBALANCE_IN_PROGRESS(4004, HttpStatus.CONFLICT),
  DUPLICATED_ENTITY(4005, HttpStatus.CONFLICT),
  UNPROCESSABLE_ENTITY(4006, HttpStatus.UNPROCESSABLE_ENTITY),
  CLUSTER_NOT_FOUND(4007, HttpStatus.NOT_FOUND),
  TOPIC_NOT_FOUND(4008, HttpStatus.NOT_FOUND),
  SCHEMA_NOT_FOUND(4009, HttpStatus.NOT_FOUND),
  CONNECT_NOT_FOUND(4010, HttpStatus.NOT_FOUND);

  static {
    // codes uniqueness check
    var codes = new HashSet<Integer>();
    for (ErrorCode value : ErrorCode.values()) {
      if (!codes.add(value.code())) {
        LogManager.getLogger()
            .warn("Multiple {} values refer to code {}", ErrorCode.class, value.code);
      }
    }
  }

  private final int code;
  private final HttpStatus httpStatus;

  ErrorCode(int code, HttpStatus httpStatus) {
    this.code = code;
    this.httpStatus = httpStatus;
  }

  public int code() {
    return code;
  }

  public HttpStatus httpStatus() {
    return httpStatus;
  }
}
