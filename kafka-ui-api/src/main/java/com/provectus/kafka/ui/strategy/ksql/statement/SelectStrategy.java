package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import org.springframework.stereotype.Component;

@Component
public class SelectStrategy extends BaseStrategy {

  @Override
  public KsqlCommandResponse serializeResponse(JsonNode response) {
    return serializeQueryResponse(response);
  }

  @Override
  protected String getRequestPath() {
    return BaseStrategy.queryRequestPath;
  }

  @Override
  protected String getTestRegExp() {
    return "select (.*) from (.*);";
  }
}
