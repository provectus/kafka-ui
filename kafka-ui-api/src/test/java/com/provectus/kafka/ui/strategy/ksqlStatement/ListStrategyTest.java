package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
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
class ListStrategyTest {
  private KsqlStatementStrategy ksqlStatementStrategy;
  private ObjectMapper mapper = new ObjectMapper();

  @BeforeEach
  public void setUp() {
    ksqlStatementStrategy = new ListStrategy();
  }

  @Test
  public void shouldReturnUri() {
    ksqlStatementStrategy.host("ksqldb-server:8088");
    assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  public void shouldReturnTrueInTest() {
    assertTrue(ksqlStatementStrategy.test("LIST STREAMS;"));
    assertTrue(ksqlStatementStrategy.test("LIST TABLES;"));
    assertTrue(ksqlStatementStrategy.test("LIST TOPICS;"));
    assertTrue(ksqlStatementStrategy.test("LIST FUNCTIONS;"));
  }

  @Test
  public void shouldReturnFalseInTest() {
    assertFalse(ksqlStatementStrategy.test("SHOW STREAMS;"));
    assertFalse(ksqlStatementStrategy.test("SHOW TABLES;"));
    assertFalse(ksqlStatementStrategy.test("SHOW TOPICS;"));
    assertFalse(ksqlStatementStrategy.test("SHOW FUNCTIONS;"));
  }

  @Test
  public void shouldSerializeStreamsResponse() {
    JsonNode node = getResponseWithData("streams");
    ksqlStatementStrategy.test("list streams;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeTablesResponse() {
    JsonNode node = getResponseWithData("tables");
    ksqlStatementStrategy.test("list tables;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeTopicsResponse() {
    JsonNode node = getResponseWithData("topics");
    ksqlStatementStrategy.test("list topics;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeFunctionsResponse() {
    JsonNode node = getResponseWithData("functions");
    ksqlStatementStrategy.test("list functions;");
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value")));
  }

  @Test
  public void shouldSerializeWithException() {
    JsonNode node = getResponseWithData("streams");
    ksqlStatementStrategy.test("list tables;");
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
