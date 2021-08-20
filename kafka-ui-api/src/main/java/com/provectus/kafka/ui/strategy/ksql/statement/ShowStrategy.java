package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class ShowStrategy extends BaseStrategy {
  private static final List<String> SHOW_STATEMENTS =
      List.of("functions", "topics", "streams", "tables", "queries", "properties");
  private static final List<String> LIST_STATEMENTS =
      List.of("functions", "topics", "streams", "tables");
  private String responseValueKey = "";

  @Override
  public KsqlCommandResponse serializeResponse(JsonNode response) {
    return serializeTableResponse(response, responseValueKey);
  }

  @Override
  public boolean test(String sql) {
    Optional<String> statement = SHOW_STATEMENTS.stream()
        .filter(s -> testSql(sql, getShowRegExp(s)) || testSql(sql, getListRegExp(s)))
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

  @Override
  public BaseStrategy ksqlCommand(KsqlCommand ksqlCommand) {
    // return new instance to avoid conflicts for parallel requests
    ShowStrategy clone = new ShowStrategy();
    clone.setResponseValueKey(responseValueKey);
    clone.ksqlCommand = ksqlCommand;
    return clone;
  }

  protected String getShowRegExp(String key) {
    return "show " + key + ";";
  }

  protected String getListRegExp(String key) {
    if (LIST_STATEMENTS.contains(key)) {
      return "list " + key + ";";
    }
    return "";
  }

  private void setResponseValueKey(String path) {
    responseValueKey = path;
  }

  private boolean testSql(String sql, String pattern) {
    return sql.trim().toLowerCase().matches(pattern);
  }
}
