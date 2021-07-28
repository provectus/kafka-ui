package com.provectus.kafka.ui.model.schemaregistry;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ErrorResponse {

  @JsonProperty("error_code")
  private int errorCode;

  private String message;

}
