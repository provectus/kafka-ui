package com.provectus.kafka.ui.exception;

import java.util.HashSet;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;


public enum ErrorCode {

  FORBIDDEN(403, HttpStatus.FORBIDDEN),

  UNEXPECTED(5000, HttpStatus.INTERNAL_SERVER_ERROR),
  KSQL_API_ERROR(5001, HttpStatus.INTERNAL_SERVER_ERROR),
  BINDING_FAIL(4001, HttpStatus.BAD_REQUEST),
  NOT_FOUND(404, HttpStatus.NOT_FOUND),
  VALIDATION_FAIL(4002, HttpStatus.BAD_REQUEST),
  READ_ONLY_MODE_ENABLE(4003, HttpStatus.METHOD_NOT_ALLOWED),
  CONNECT_CONFLICT_RESPONSE(4004, HttpStatus.CONFLICT),
  DUPLICATED_ENTITY(4005, HttpStatus.CONFLICT),
  UNPROCESSABLE_ENTITY(4006, HttpStatus.UNPROCESSABLE_ENTITY),
  CLUSTER_NOT_FOUND(4007, HttpStatus.NOT_FOUND),
  TOPIC_NOT_FOUND(4008, HttpStatus.NOT_FOUND),
  SCHEMA_NOT_FOUND(4009, HttpStatus.NOT_FOUND),
  CONNECT_NOT_FOUND(4010, HttpStatus.NOT_FOUND),
  KSQLDB_NOT_FOUND(4011, HttpStatus.NOT_FOUND),
  DIR_NOT_FOUND(4012, HttpStatus.BAD_REQUEST),
  TOPIC_OR_PARTITION_NOT_FOUND(4013, HttpStatus.BAD_REQUEST),
  INVALID_REQUEST(4014, HttpStatus.BAD_REQUEST),
  RECREATE_TOPIC_TIMEOUT(4015, HttpStatus.REQUEST_TIMEOUT),
  INVALID_ENTITY_STATE(4016, HttpStatus.BAD_REQUEST),
  SCHEMA_NOT_DELETED(4017, HttpStatus.INTERNAL_SERVER_ERROR),
  TOPIC_ANALYSIS_ERROR(4018, HttpStatus.BAD_REQUEST);

  static {
    // codes uniqueness check
    var codes = new HashSet<Integer>();
    for (ErrorCode value : ErrorCode.values()) {
      if (!codes.add(value.code())) {
        LoggerFactory.getLogger(ErrorCode.class)
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
