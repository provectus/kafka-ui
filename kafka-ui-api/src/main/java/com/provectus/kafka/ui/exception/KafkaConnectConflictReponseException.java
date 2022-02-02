package com.provectus.kafka.ui.exception;


import org.springframework.web.reactive.function.client.WebClientResponseException;

public class KafkaConnectConflictReponseException extends CustomBaseException {

  public KafkaConnectConflictReponseException(WebClientResponseException.Conflict e) {
    super("Kafka Connect responded with 409 (Conflict) code. Response body: "
        + e.getResponseBodyAsString());
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.CONNECT_CONFLICT_RESPONSE;
  }
}
