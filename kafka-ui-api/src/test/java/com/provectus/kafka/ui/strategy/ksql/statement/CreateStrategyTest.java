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
class CreateStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private CreateStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new CreateStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("CREATE STREAM stream WITH (KAFKA_TOPIC='topic');"));
    assertTrue(strategy.test("CREATE STREAM stream"
        + " AS SELECT users.id AS userid FROM users EMIT CHANGES;"
    ));
    assertTrue(strategy.test(
        "CREATE TABLE table (id VARCHAR) WITH (KAFKA_TOPIC='table');"
    ));
    assertTrue(strategy.test(
        "CREATE TABLE pageviews_regions WITH (KEY_FORMAT='JSON')"
            + "  AS SELECT gender, COUNT(*) AS numbers"
            + "  FROM pageviews EMIT CHANGES;"
    ));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("show streams;"));
    assertFalse(strategy.test("show tables;"));
    assertFalse(strategy.test("CREATE TABLE test;"));
    assertFalse(strategy.test("CREATE STREAM test;"));
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
