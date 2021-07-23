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
class SelectStrategyTest {
    private KsqlStatementStrategy ksqlStatementStrategy;
    private ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    public void setUp() {
        ksqlStatementStrategy = new SelectStrategy();
    }

    @Test
    public void shouldReturnUri() {
        ksqlStatementStrategy.host("ksqldb-server:8088");
        assertThat(ksqlStatementStrategy.getUri()).isEqualTo("ksqldb-server:8088/query");
    }

    @Test
    public void shouldReturnTrueInTest() {
        assertTrue(ksqlStatementStrategy.test("select * from users;"));
    }

    @Test
    public void shouldReturnFalseInTest() {
        assertFalse(ksqlStatementStrategy.test("show streams;"));
        assertFalse(ksqlStatementStrategy.test("select *;"));
    }

    @Test
    public void shouldSerializeResponse() {
        JsonNode node = getResponseWithData();
        KsqlCommandResponse serializedResponse = ksqlStatementStrategy.serializeResponse(node);
        Table table = serializedResponse.getData();
        assertThat(table.getHeaders()).isEqualTo(List.of("header1", "header2"));
        assertThat(table.getRows()).isEqualTo(List.of(List.of("value1", "value2")));
    }

    @Test
    public void shouldSerializeWithException() {
        JsonNode node = mapper.createObjectNode();
        Exception exception = assertThrows(
                UnprocessableEntityException.class,
                () -> ksqlStatementStrategy.serializeResponse(node)
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
