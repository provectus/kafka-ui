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
class SelectStrategyTest {
  private final ObjectMapper mapper = new ObjectMapper();
  private SelectStrategy strategy;

  @BeforeEach
  void setUp() {
    strategy = new SelectStrategy();
  }

  @Test
  void shouldReturnUri() {
    strategy.host("ksqldb-server:8088");
    assertThat(strategy.getUri()).isEqualTo("ksqldb-server:8088/query");
  }

  @Test
  void shouldReturnTrueInTest() {
    assertTrue(strategy.test("select * from users;"));
  }

  @Test
  void shouldReturnFalseInTest() {
    assertFalse(strategy.test("show streams;"));
    assertFalse(strategy.test("select *;"));
  }

  @Test
  void shouldSerializeResponse() {
    JsonNode node = getResponseWithData();
    KsqlCommandResponseDTO serializedResponse = strategy.serializeResponse(node);
    TableDTO table = serializedResponse.getData();
    assertThat(table.getHeaders()).isEqualTo(List.of("header1", "header2"));
    assertThat(table.getRows()).isEqualTo(List.of(List.of("value1", "value2")));
  }

  @Test
  void shouldSerializeWithException() {
    JsonNode node = mapper.createObjectNode();
    Exception exception = assertThrows(
        UnprocessableEntityException.class,
        () -> strategy.serializeResponse(node)
    );

    assertThat(exception.getMessage()).isEqualTo("KSQL DB response mapping error");
  }

  @SneakyThrows
  private JsonNode getResponseWithData() {
    JsonNode headerNode = mapper.createObjectNode().set(
        "header", mapper.createObjectNode().put("schema", "header1, header2")
    );
    JsonNode row = mapper.createObjectNode().set(
        "row", mapper.createObjectNode().set(
            "columns", mapper.createArrayNode().add("value1").add("value2")
        )
    );
    return mapper.createArrayNode().add(headerNode).add(row);
  }
}
