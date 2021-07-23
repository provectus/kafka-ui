package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class ListStrategy extends KsqlStatementStrategy {
  private final String requestPath = "/ksql";
  private final List<String> statements = List.of("functions", "topics", "streams", "tables");
  private String responseValueKey = "";

  @Override
  public KsqlCommandResponse serializeResponse(JsonNode response) {
    return serializeTableResponse(response, responseValueKey);
  }

  @Override
  protected String getRequestPath() {
    return requestPath;
  }

  @Override
  public boolean test(String sql) {
    Optional<String> statement = statements.stream()
        .filter(s -> sql.trim().toLowerCase().matches(getTestRegExp(s)))
        .findFirst();
    if (statement.isPresent()) {
      setResponseValueKey(statement.get());
      return true;
    }
    return false;
  }

  @Override
  protected String getTestRegExp() {
    return "";
  }

  private String getTestRegExp(String key) {
    return "list " + key + ";";
  }

  private void setResponseValueKey(String path) {
    responseValueKey = path;
  }
}
