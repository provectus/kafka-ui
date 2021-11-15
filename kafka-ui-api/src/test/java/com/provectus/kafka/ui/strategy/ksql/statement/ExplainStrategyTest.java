package com.provectus.kafka.ui.strategy.ksql.statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import com.provectus.kafka.ui.model.TableDTO;
import java.util.List;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExplainStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private ExplainStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new ExplainStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/ksql");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("explain users_query_id;"));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("show queries;"));
  }

  @Test
  void shouldSerializeResponse() {
    JsonNode node = getResponseWithObjectNode();
    KsqlCommandResponseDTO serializedResponse = strategy.serializeResponse(node);
    TableDTO table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("key", "value"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("name", "kafka")));
  }

  @Test
  void shouldSerializeWithException() {
    JsonNode sourceDescriptionNode =
        mapper.createObjectNode().put("sourceDescription", "nodeWithMessage");
    JsonNode node = mapper.createArrayNode().add(mapper.valueToTree(sourceDescriptionNode));
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> strategy.serializeResponse(node)
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
