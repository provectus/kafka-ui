package com.provectus.kafka.ui.strategy.ksqlStatement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CreateStrategyTest {
  private KsqlStatementStrategy ksqlStatementStrategy;
  private ObjectMapper mapper = new ObjectMapper();

  @BeforeEach
  public void setUp() {
    ksqlStatementStrategy = new CreateStrategy();
  }

  @Test
  public void shouldReturnUri() {
    ksqlStatementStrategy.host("ksqldb-server:8088");
    assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  public void shouldReturnTrueInTest() {
    assertTrue(ksqlStatementStrategy.test("CREATE STREAM stream WITH (KAFKA_TOPIC='topic');"));
    assertTrue(ksqlStatementStrategy.test("CREATE STREAM stream" +
        " AS SELECT users.id AS userid FROM users EMIT CHANGES;"
    ));
    assertTrue(ksqlStatementStrategy.test(
        "CREATE TABLE table (id VARCHAR) WITH (KAFKA_TOPIC='table');"
    ));
    assertTrue(ksqlStatementStrategy.test(
        "CREATE TABLE pageviews_regions WITH (KEY_FORMAT='JSON')" +
            "  AS SELECT gender, COUNT(*) AS numbers" +
            "  FROM pageviews EMIT CHANGES;"
    ));
  }

  @Test
  public void shouldReturnFalseInTest() {
    assertFalse(ksqlStatementStrategy.test("show streams;"));
    assertFalse(ksqlStatementStrategy.test("show tables;"));
    assertFalse(ksqlStatementStrategy.test("CREATE TABLE test;"));
    assertFalse(ksqlStatementStrategy.test("CREATE STREAM test;"));
  }

  @Test
  public void shouldSerializeResponse() {
    String message = "updated successful";
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
