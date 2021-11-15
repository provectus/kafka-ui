package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class ExplainStrategy extends BaseStrategy {
  private static final String RESPONSE_VALUE_KEY = "queryDescription";

  @Override
  public KsqlCommandResponseDTO serializeResponse(JsonNode response) {
    return serializeTableResponse(response, RESPONSE_VALUE_KEY);
  }

  @Override
  protected String getTestRegExp() {
    return "explain (.*);";
  }
}
