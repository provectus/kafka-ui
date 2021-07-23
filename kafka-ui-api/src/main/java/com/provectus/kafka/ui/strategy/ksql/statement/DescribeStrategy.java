package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import org.springframework.stereotype.Component;

@Component
public class DescribeStrategy extends BaseStrategy {
  private static final String responseValueKey = "sourceDescription";

  @Override
  public KsqlCommandResponse serializeResponse(JsonNode response) {
    return serializeTableResponse(response, responseValueKey);
  }

  @Override
  protected String getRequestPath() {
    return BaseStrategy.ksqlRequestPath;
  }

  @Override
  protected String getTestRegExp() {
    return "describe (.*);";
  }
}
