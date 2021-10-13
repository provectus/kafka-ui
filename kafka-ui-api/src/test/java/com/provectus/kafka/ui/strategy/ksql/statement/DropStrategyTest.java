package com.provectus.kafka.ui.strategy.ksql.statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DropStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private DropStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new DropStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("drop table table1;"));
    assertTrue(strategy.test("drop stream stream2;"));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("show streams;"));
    assertFalse(strategy.test("show tables;"));
    assertFalse(strategy.test("create table test;"));
    assertFalse(strategy.test("create stream test;"));
  }

  @Test
  void shouldSerializeResponse() {
    String message = "updated successful";
    JsonNode node = getResponseWithMessage(message);
    KsqlCommandResponseDTO serializedResponse = strategy.serializeResponse(node);
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
