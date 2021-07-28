package com.provectus.kafka.ui.strategy.ksql.statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import com.provectus.kafka.ui.model.Table;
import java.util.List;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ShowStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private ShowStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new ShowStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("SHOW STREAMS;"));
    assertTrue(strategy.test("SHOW TABLES;"));
    assertTrue(strategy.test("SHOW TOPICS;"));
    assertTrue(strategy.test("SHOW QUERIES;"));
    assertTrue(strategy.test("SHOW PROPERTIES;"));
    assertTrue(strategy.test("SHOW FUNCTIONS;"));
    assertTrue(strategy.test("LIST STREAMS;"));
    assertTrue(strategy.test("LIST TABLES;"));
    assertTrue(strategy.test("LIST TOPICS;"));
    assertTrue(strategy.test("LIST FUNCTIONS;"));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("LIST QUERIES;"));
    assertFalse(strategy.test("LIST PROPERTIES;"));
  }

  @Test
  void shouldSerializeStreamsResponse() {
    JsonNode node = getResponseWithData("streams");
    strategy.test("show streams;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializeTablesResponse() {
    JsonNode node = getResponseWithData("tables");
    strategy.test("show tables;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializeTopicsResponse() {
    JsonNode node = getResponseWithData("topics");
    strategy.test("show topics;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializePropertiesResponse() {
    JsonNode node = getResponseWithData("properties");
    strategy.test("show properties;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializeFunctionsResponse() {
    JsonNode node = getResponseWithData("functions");
    strategy.test("show functions;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializeQueriesResponse() {
    JsonNode node = getResponseWithData("queries");
    strategy.test("show queries;");
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  void shouldSerializeWithException() {
    JsonNode node = getResponseWithData("streams");
    strategy.test("show tables;");
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> strategy.serializeResponse(node)
    );

    assertThat(exception.getMessage()).isEqualTo("KSQL DB response mapping error");
  }

  @SneakyThrows
  private JsonNode getResponseWithData(String key) {
    JsonNode nodeWithDataItem = mapper.createObjectNode().put("header", "value");
    JsonNode nodeWithData = mapper.createArrayNode().add(nodeWithDataItem);
    JsonNode nodeWithResponse = mapper.createObjectNode().set(key, nodeWithData);
    return mapper.createArrayNode().add(mapper.valueToTree(nodeWithResponse));
  }
}
