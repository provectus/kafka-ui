package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import org.springframework.stereotype.Component;

@Component
public class TerminateStrategy extends KsqlStatementStrategy {
  private final String requestPath = "/ksql";
  private final String responseValueKey = "commandStatus";

  @Override
  public KsqlCommandResponse serializeResponse(JsonNode response) {
    return serializeMessageResponse(response, responseValueKey);
  }

  @Override
  protected String getRequestPath() {
    return requestPath;
  }

  @Override
  protected String getTestRegExp() {
    return "terminate (.*);";
  }
}
