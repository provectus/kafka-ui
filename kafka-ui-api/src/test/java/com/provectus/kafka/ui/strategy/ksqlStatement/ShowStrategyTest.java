package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import com.provectus.kafka.ui.model.KsqlResponseTable;
import com.provectus.kafka.ui.model.Table;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ShowStrategyTest {
  private KsqlStatementStrategy ksqlStatementStrategy;
  private ObjectMapper mapper = new ObjectMapper();

  @BeforeEach
  public void setUp() {
    ksqlStatementStrategy = new ShowStrategy();
  }

  @Test
  public void shouldReturnUri() {
    ksqlStatementStrategy.host("ksqldb-server:8088");
    assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  public void shouldReturnTrueInTest() {
    assertTrue(ksqlStatementStrategy.test("SHOW STREAMS;"));
    assertTrue(ksqlStatementStrategy.test("SHOW TABLES;"));
    assertTrue(ksqlStatementStrategy.test("SHOW TOPICS;"));
    assertTrue(ksqlStatementStrategy.test("SHOW QUERIES;"));
    assertTrue(ksqlStatementStrategy.test("SHOW PROPERTIES;"));
    assertTrue(ksqlStatementStrategy.test("SHOW FUNCTIONS;"));
  }

  @Test
  public void shouldReturnFalseInTest() {
    assertFalse(ksqlStatementStrategy.test("LIST STREAMS;"));
    assertFalse(ksqlStatementStrategy.test("LIST TABLES;"));
    assertFalse(ksqlStatementStrategy.test("LIST TOPICS;"));
    assertFalse(ksqlStatementStrategy.test("LIST QUERIES;"));
    assertFalse(ksqlStatementStrategy.test("LIST PROPERTIES;"));
    assertFalse(ksqlStatementStrategy.test("LIST FUNCTIONS;"));
  }

  @Test
  public void shouldSerializeStreamsResponse() {
    JsonNode node = getResponseWithData("streams");
    ksqlStatementStrategy.test("show streams;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeTablesResponse() {
    JsonNode node = getResponseWithData("tables");
    ksqlStatementStrategy.test("show tables;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeTopicsResponse() {
    JsonNode node = getResponseWithData("topics");
    ksqlStatementStrategy.test("show topics;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializePropertiesResponse() {
    JsonNode node = getResponseWithData("properties");
    ksqlStatementStrategy.test("show properties;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeFunctionsResponse() {
    JsonNode node = getResponseWithData("functions");
    ksqlStatementStrategy.test("show functions;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeQueriesResponse() {
    JsonNode node = getResponseWithData("queries");
    ksqlStatementStrategy.test("show queries;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeWithException() {
    JsonNode node = getResponseWithData("streams");
    ksqlStatementStrategy.test("show tables;");
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> ksqlStatementStrategy.serializeResponse(node)
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
