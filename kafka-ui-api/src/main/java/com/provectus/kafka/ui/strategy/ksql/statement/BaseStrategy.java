package com.provectus.kafka.ui.strategy.ksql.statement;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import com.provectus.kafka.ui.model.Table;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public abstract class BaseStrategy {
  protected static final String KSQL_REQUEST_PATH = "/ksql";
  protected static final String QUERY_REQUEST_PATH = "/query";
  private static final String MAPPING_EXCEPTION_ERROR = "KSQL DB response mapping error";
  protected String host = null;
  protected KsqlCommand ksqlCommand = null;

  public String getUri() {
    if (this.host != null) {
      return this.host + this.getRequestPath();
    }
    throw new UnprocessableEntityException("Strategy doesn't have host");
  }

  public boolean test(String sql) {
    return sql.trim().toLowerCase().matches(getTestRegExp());
  }

  public BaseStrategy host(String host) {
    this.host = host;
    return this;
  }

  public KsqlCommand getKsqlCommand() {
    return ksqlCommand;
  }

  public BaseStrategy ksqlCommand(KsqlCommand ksqlCommand) {
    this.ksqlCommand = ksqlCommand;
    return this;
  }

  protected String getRequestPath() {
    return BaseStrategy.KSQL_REQUEST_PATH;
  }

  protected KsqlCommandResponse serializeTableResponse(JsonNode response, String key) {
    JsonNode item = getResponseFirstItemValue(response, key);
    Table table = item.isArray() ? getTableFromArray(item) : getTableFromObject(item);
    return (new KsqlCommandResponse()).data(table);
  }

  protected KsqlCommandResponse serializeMessageResponse(JsonNode response, String key) {
    JsonNode item = getResponseFirstItemValue(response, key);
    return (new KsqlCommandResponse()).message(getMessageFromObject(item));
  }

  protected KsqlCommandResponse serializeQueryResponse(JsonNode response) {
    if (response.isArray() && response.size() > 0) {
      Table table = (new Table())
          .headers(getQueryResponseHeader(response))
          .rows(getQueryResponseRows(response));
      return (new KsqlCommandResponse()).data(table);
    }
    throw new UnprocessableEntityException(MAPPING_EXCEPTION_ERROR);
  }

  private JsonNode getResponseFirstItemValue(JsonNode response, String key) {
    if (response.isArray() && response.size() > 0) {
      JsonNode first = response.get(0);
      if (first.has(key)) {
        return first.path(key);
      }
    }
    throw new UnprocessableEntityException(MAPPING_EXCEPTION_ERROR);
  }

  private List<String> getQueryResponseHeader(JsonNode response) {
    JsonNode headerRow = response.get(0);
    if (headerRow.isObject() && headerRow.has("header")) {
      String schema = headerRow.get("header").get("schema").asText();
      return Arrays.stream(schema.split(",")).map(String::trim).collect(Collectors.toList());
    }
    return new ArrayList<>();
  }

  private List<List<String>> getQueryResponseRows(JsonNode node) {
    return getStreamForJsonArray(node)
        .filter(row -> row.has("row") && row.get("row").has("columns"))
        .map(row -> row.get("row").get("columns"))
        .map(cellNode -> getStreamForJsonArray(cellNode)
            .map(JsonNode::asText)
            .collect(Collectors.toList())
        )
        .collect(Collectors.toList());
  }

  private Table getTableFromArray(JsonNode node) {
    Table table = new Table();
    table.headers(new ArrayList<>()).rows(new ArrayList<>());
    if (node.size() > 0) {
      List<String> keys = getJsonObjectKeys(node.get(0));
      List<List<String>> rows = getTableRows(node, keys);
      table.headers(keys).rows(rows);
    }
    return table;
  }

  private Table getTableFromObject(JsonNode node) {
    List<String> keys = getJsonObjectKeys(node);
    List<String> values = getJsonObjectValues(node);
    List<List<String>> rows = IntStream
        .range(0, keys.size())
        .mapToObj(i -> List.of(keys.get(i), values.get(i)))
        .collect(Collectors.toList());
    return (new Table()).headers(List.of("key", "value")).rows(rows);
  }

  private String getMessageFromObject(JsonNode node) {
    if (node.isObject() && node.has("message")) {
      return node.get("message").asText();
    }
    throw new UnprocessableEntityException(MAPPING_EXCEPTION_ERROR);
  }

  private List<List<String>> getTableRows(JsonNode node, List<String> keys) {
    return getStreamForJsonArray(node)
        .map(row -> keys.stream()
            .map(header -> row.get(header).asText())
            .collect(Collectors.toList())
        )
        .collect(Collectors.toList());
  }

  private Stream<JsonNode> getStreamForJsonArray(JsonNode node) {
    if (node.isArray() && node.size() > 0) {
      return StreamSupport.stream(node.spliterator(), false);
    }
    throw new UnprocessableEntityException(MAPPING_EXCEPTION_ERROR);
  }

  private List<String> getJsonObjectKeys(JsonNode node) {
    if (node.isObject()) {
      return StreamSupport.stream(
          Spliterators.spliteratorUnknownSize(node.fieldNames(), Spliterator.ORDERED), false
      ).collect(Collectors.toList());
    }
    throw new UnprocessableEntityException(MAPPING_EXCEPTION_ERROR);
  }

  private List<String> getJsonObjectValues(JsonNode node) {
    return getJsonObjectKeys(node).stream().map(key -> node.get(key).asText())
        .collect(Collectors.toList());
  }

  public abstract KsqlCommandResponse serializeResponse(JsonNode response);

  protected abstract String getTestRegExp();
}
