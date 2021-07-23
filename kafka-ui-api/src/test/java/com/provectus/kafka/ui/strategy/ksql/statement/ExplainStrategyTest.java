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
class ExplainStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private KsqlStatementStrategy ksqlStatementStrategy;

  @BeforeEach
  public void setUp() {
    ksqlStatementStrategy = new ExplainStrategy();
  }

  @Test
  public void shouldReturnUri() {
    ksqlStatementStrategy.host("ksqldb-server:8088");
    assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  public void shouldReturnTrueInTest() {
    assertTrue(ksqlStatementStrategy.test("explain users_query_id;"));
  }

  @Test
  public void shouldReturnFalseInTest() {
    assertFalse(ksqlStatementStrategy.test("show queries;"));
  }

  @Test
  public void shouldSerializeResponse() {
    JsonNode node = getResponseWithObjectNode();
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    Table table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("key", "value"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("name", "kafka")));
  }

  @Test
  public void shouldSerializeWithException() {
    JsonNode sourceDescriptionNode =
        mapper.createObjectNode().put("sourceDescription", "nodeWithMessage");
    JsonNode node = mapper.createArrayNode().add(mapper.valueToTree(sourceDescriptionNode));
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> ksqlStatementStrategy.serializeResponse(node)
    );

    assertThat(exception.getMessage()).isEqualTo("KSQL DB response mapping error");
  }

  @SneakyThrows
  private JsonNode getResponseWithObjectNode() {
    JsonNode nodeWithMessage = mapper.createObjectNode().put("name", "kafka");
    JsonNode nodeWithResponse = mapper.createObjectNode().set("queryDescription", nodeWithMessage);
    return mapper.createArrayNode().add(mapper.valueToTree(nodeWithResponse));
  }
}
