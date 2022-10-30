package com.provectus.kafka.ui.service.masking.policies;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ContainerNode;
import java.util.List;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;

class RemoveTest {

  private final static List<String> TARGET_FIELDS = List.of("id", "name");

  @ParameterizedTest
  @MethodSource
  void testJsonContainer(List<String> fields, ContainerNode<?> original, ContainerNode<?>  expected) {
    var policy = new Remove(fields);
    assertThat(policy.applyToJsonContainer(original)).isEqualTo(expected);
  }

  private static Stream<Arguments> testJsonContainer() {
    return Stream.of(
        Arguments.of(
            TARGET_FIELDS,
            parse("{ \"id\": 123, \"name\": { \"first\": \"James\", \"surname\": \"Bond777!\"}}"),
            parse("{}")
        ),
        Arguments.of(
            TARGET_FIELDS,
            parse("[{ \"id\": 123, \"f2\": 234}, { \"name\": \"1.2\", \"f2\": 345} ]"),
            parse("[{ \"f2\": 234}, { \"f2\": 345} ]")
        ),
        Arguments.of(
            TARGET_FIELDS,
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Bond777!\"}}"),
            parse("{ \"outer\": { \"f1\": \"James\"}}")
        ),
        Arguments.of(
            List.of(),
            parse("{ \"outer\": { \"f1\": \"v1\", \"f2\": \"v2\", \"inner\" : {\"if1\": \"iv1\"}}}"),
            parse("{}")
        ),
        Arguments.of(
            List.of(),
            parse("[{ \"f1\": 123}, { \"f2\": \"1.2\"} ]"),
            parse("[{}, {}]")
        )
    );
  }

  @SneakyThrows
  private static JsonNode parse(String str) {
    return new JsonMapper().readTree(str);
  }

  @ParameterizedTest
  @CsvSource({
      "Some string?!1, null",
      "1.24343, null",
      "null, null"
  })
  void testString(String original, String expected) {
    var policy = new Remove(List.of());
    assertThat(policy.applyToString(original)).isEqualTo(expected);
  }
}