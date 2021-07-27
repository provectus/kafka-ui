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
  private TerminateStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new TerminateStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("terminate query_id;"));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("show streams;"));
    assertFalse(strategy.test("create table test;"));
  }

  @Test
  void shouldSerializeResponse() {
    String message = "query terminated.";
    JsonNode node = getResponseWithMessage(message);
    KsqlCommandResponse serializedResponse = strategy.serializeResponse(node);
    assertThat(serializedResponse.getMessage()).isEqualTo(message);

  }

  @Test
  void shouldSerializeWithException() {
    JsonNode commandStatusNode = mapper.createObjectNode().put("commandStatus", "nodeWithMessage");
    JsonNode node = mapper.createArrayNode().add(mapper.valueToTree(commandStatusNode));
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> strategy.serializeResponse(node)
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
