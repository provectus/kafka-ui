package com.provectus.kafka.ui.service.ksql.response;

import static com.provectus.kafka.ui.service.ksql.KsqlApiClient.KsqlResponseTable;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


class DynamicParser {

  static KsqlResponseTable parseArray(String tableName, JsonNode arr) {
    return parseArray(tableName, getFieldNames(arr), arr);
  }

  static KsqlResponseTable parseArray(String tableName,
                                                    List<String> columnNames,
                                                    JsonNode arr) {
    return KsqlResponseTable.builder()
        .header(tableName)
        .columnNames(columnNames)
        .values(
            StreamSupport.stream(arr.spliterator(), false)
                .map(node ->
                    columnNames.stream()
                        .map(node::get)
                        .collect(Collectors.toList()))
                .collect(Collectors.toList())
        ).build();
  }

  private static List<String> getFieldNames(JsonNode arr) {
    List<String> fields = new ArrayList<>();
    arr.forEach(node -> node.fieldNames().forEachRemaining(f -> {
      if (!fields.contains(f)) {
        fields.add(f);
      }
    }));
    return fields;
  }

  static KsqlResponseTable parseObject(String tableName, JsonNode node) {
    if (!node.isObject()) {
      return KsqlResponseTable.builder()
          .header(tableName)
          .columnNames(List.of("value"))
          .values(List.of(List.of(node)))
          .build();
    }
    return parseObject(tableName, Lists.newArrayList(node.fieldNames()), node);
  }

  static KsqlResponseTable parseObject(String tableName, List<String> columnNames, JsonNode node) {
    return KsqlResponseTable.builder()
        .header(tableName)
        .columnNames(columnNames)
        .values(
            List.of(
                columnNames.stream()
                    .map(node::get)
                    .collect(Collectors.toList()))
        )
        .build();
  }

}
