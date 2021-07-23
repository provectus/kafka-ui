package com.provectus.kafka.ui.strategy.ksql.statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TerminateStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private KsqlStatementStrategy ksqlStatementStrategy;

  @BeforeEach
  public void setUp() {
    ksqlStatementStrategy = new TerminateStrategy();
  }

  @Test
  public void shouldReturnUri() {
    ksqlStatementStrategy.host("ksqldb-server:8088");
    assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  public void shouldReturnTrueInTest() {
    assertTrue(ksqlStatementStrategy.test("terminate query_id;"));
  }

  @Test
  public void shouldReturnFalseInTest() {
    assertFalse(ksqlStatementStrategy.test("show streams;"));
    assertFalse(ksqlStatementStrategy.test("create table test;"));
  }

  @Test
  public void shouldSerializeResponse() {
    String message = "query terminated.";
    JsonNode node = getResponseWithMessage(message);
    KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
    assertThat(serializedResponse.getMessage()).isEqualTo(message);

  }

  @Test
  public void shouldSerializeWithException() {
    JsonNode commandStatusNode = mapper.createObjectNode().put("commandStatus", "nodeWithMessage");
    JsonNode node = mapper.createArrayNode().add(mapper.valueToTree(commandStatusNode));
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> ksqlStatementStrategy.serializeResponse(node)
    );

    assertThat(exception.getMessage()).isEqualTo("KSQL DB response mapping error");
  }

  @SneakyThrows
  private JsonNode getResponseWithMessage(String message) {
    JsonNode nodeWithMessage = mapper.createObjectNode().put("message", message);
    JsonNode commandStatusNode = mapper.createObjectNode().set("commandStatus", nodeWithMessage);
    return mapper.createArrayNode().add(mapper.valueToTree(commandStatusNode));
  }
}
