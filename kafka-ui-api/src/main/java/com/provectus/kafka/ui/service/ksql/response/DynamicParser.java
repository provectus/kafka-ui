package com.provectus.kafka.ui.service.ksql.response;

import static com.provectus.kafka.ui.service.ksql.KsqlApiClient.KsqlResponseTable;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


class DynamicParser {

  private DynamicParser() {
  }

  static KsqlResponseTable parseArray(String tableName, JsonNode array) {
    return parseArray(tableName, getFieldNamesFromArray(array), array);
  }

  static KsqlResponseTable parseArray(String tableName,
                                      List<String> columnNames,
                                      JsonNode array) {
    return KsqlResponseTable.builder()
        .header(tableName)
        .columnNames(columnNames)
        .values(
            StreamSupport.stream(array.spliterator(), false)
                .map(node ->
                    columnNames.stream()
                        .map(node::get)
                        .collect(Collectors.toList()))
                .collect(Collectors.toList())
        ).build();
  }

  private static List<String> getFieldNamesFromArray(JsonNode array) {
    List<String> fields = new ArrayList<>();
    array.forEach(node -> node.fieldNames().forEachRemaining(f -> {
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
