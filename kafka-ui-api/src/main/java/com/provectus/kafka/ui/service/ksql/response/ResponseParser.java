package com.provectus.kafka.ui.service.ksql.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.google.common.collect.Lists;
import com.provectus.kafka.ui.exception.KsqlApiException;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.reactive.function.client.WebClientResponseException;

public class ResponseParser {

  private ResponseParser() {
  }

  public static Optional<KsqlApiClient.KsqlResponseTable> parseSelectResponse(JsonNode jsonNode) {
    // in response, we're getting either header record or row data
    if (arrayFieldNonEmpty(jsonNode, "header")) {
      return Optional.of(
          KsqlApiClient.KsqlResponseTable.builder()
              .header("Schema")
              .columnNames(
                  Arrays.stream(jsonNode.get("header").get("schema").asText().split(","))
                      .map(String::trim)
                      .collect(Collectors.toList())
              )
              .build());
    }
    if (arrayFieldNonEmpty(jsonNode, "row")) {
      return Optional.of(
          KsqlApiClient.KsqlResponseTable.builder()
              .header("Row")
              .values(
                  List.of(Lists.newArrayList(jsonNode.get("row").get("columns"))))
              .build());
    }
    if (jsonNode.hasNonNull("errorMessage")) {
      throw new KsqlApiException("Error: " + jsonNode.get("errorMessage"));
    }
    // remaining events can be skipped
    return Optional.empty();
  }

  public static KsqlApiClient.KsqlResponseTable parseErrorResponse(WebClientResponseException e) {
    try {
      var errBody = new JsonMapper().readTree(e.getResponseBodyAsString());
      return DynamicParser.parseObject("Execution error", errBody);
    } catch (Exception ex) {
      throw new KsqlApiException(
          String.format(
              "Unparsable error response from ksqdb, status:'%s', body: '%s'",
              e.getStatusCode(), e.getResponseBodyAsString()), e);
    }
  }

  public static List<KsqlApiClient.KsqlResponseTable> parseStatementResponse(JsonNode jsonNode) {
    var type = Optional.ofNullable(jsonNode.get("@type"))
        .map(JsonNode::asText)
        .orElse("unknown");

    // messages structure can be inferred from https://github.com/confluentinc/ksql/blob/master/ksqldb-rest-model/src/main/java/io/confluent/ksql/rest/entity/KsqlEntity.java
    switch (type) {
      case "currentStatus":
        return parseObject(
            "Status",
            List.of("status", "message"),
            jsonNode.get("commandStatus")
        );
      case "properties":
        return parseProperties(jsonNode);
      case "queries":
        return parseArray("Queries", "queries", jsonNode);
      case "sourceDescription":
        return parseObjectDynamically("Source Description", jsonNode.get("sourceDescription"));
      case "queryDescription":
        return parseArray("Queries Description", "queryDescription", jsonNode);
      case "topicDescription":
        return parseObject(
            "Topic Description",
            List.of("name", "kafkaTopic", "format", "schemaString"),
            jsonNode
        );
      case "streams":
        return parseArray("Streams", "streams", jsonNode);
      case "tables":
        return parseArray("Tables", "tables", jsonNode);
      case "kafka_topics":
        return parseArray("Topics", "topics", jsonNode);
      case "kafka_topics_extended":
        return parseArray("Topics extended", "topics", jsonNode);
      case "executionPlan":
        return parseObject("Execution plan", List.of("executionPlanText"), jsonNode);
      case "source_descriptions":
        return parseArray("Source descriptions", "sourceDescriptions", jsonNode);
      case "query_descriptions":
        return parseArray("Queries", "queryDescriptions", jsonNode);
      case "describe_function":
        return parseObject("Function description",
            List.of("name", "author", "version", "description", "functions", "path", "type"),
            jsonNode
        );
      case "function_names":
        return parseArray("Function Names", "functions", jsonNode);
      case "connector_info":
        return parseObjectDynamically("Connector Info", jsonNode.get("info"));
      case "drop_connector":
        return parseObject("Dropped connector", List.of("connectorName"), jsonNode);
      case "connector_list":
        return parseArray("Connectors", "connectors", jsonNode);
      case "connector_plugins_list":
        return parseArray("Connector Plugins", "connectorPlugins", jsonNode);
      case "connector_description":
        return parseObject("Connector Description",
            List.of("connectorClass", "status", "sources", "topics"),
            jsonNode
        );
      default:
        return parseUnknownResponse(jsonNode);
    }
  }

  private static List<KsqlApiClient.KsqlResponseTable> parseObjectDynamically(
      String tableName, JsonNode jsonNode) {
    return List.of(DynamicParser.parseObject(tableName, jsonNode));
  }

  private static List<KsqlApiClient.KsqlResponseTable> parseObject(
      String tableName, List<String> fields, JsonNode jsonNode) {
    return List.of(DynamicParser.parseObject(tableName, fields, jsonNode));
  }

  private static List<KsqlApiClient.KsqlResponseTable> parseArray(
      String tableName, String arrayField, JsonNode jsonNode) {
    return List.of(DynamicParser.parseArray(tableName, jsonNode.get(arrayField)));
  }

  private static List<KsqlApiClient.KsqlResponseTable> parseProperties(JsonNode jsonNode) {
    var tables = new ArrayList<KsqlApiClient.KsqlResponseTable>();
    if (arrayFieldNonEmpty(jsonNode, "properties")) {
      tables.add(DynamicParser.parseArray("properties", jsonNode.get("properties")));
    }
    if (arrayFieldNonEmpty(jsonNode, "overwrittenProperties")) {
      tables.add(DynamicParser.parseArray("overwrittenProperties",
          jsonNode.get("overwrittenProperties")));
    }
    if (arrayFieldNonEmpty(jsonNode, "defaultProperties")) {
      tables.add(DynamicParser.parseArray("defaultProperties", jsonNode.get("defaultProperties")));
    }
    return tables;
  }

  private static List<KsqlApiClient.KsqlResponseTable> parseUnknownResponse(JsonNode jsonNode) {
    return List.of(DynamicParser.parseObject("Ksql Response", jsonNode));
  }

  private static boolean arrayFieldNonEmpty(JsonNode json, String field) {
    return json.hasNonNull(field) && !json.get(field).isEmpty();
  }

}
