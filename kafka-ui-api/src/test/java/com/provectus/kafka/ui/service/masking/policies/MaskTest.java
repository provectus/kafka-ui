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

class MaskTest {

  private final static List<String> TARGET_FIELDS = List.of("id", "name");
  private final static List<Character> PATTERN = List.of('X', 'x', 'n', '-');

  @ParameterizedTest
  @MethodSource
  void testJsonContainer(List<String> fields, ContainerNode<?> original, ContainerNode<?>  expected) {
    Mask policy = new Mask(fields, PATTERN);
    assertThat(policy.applyToJsonContainer(original)).isEqualTo(expected);
  }

  private static Stream<Arguments> testJsonContainer() {
    return Stream.of(
        Arguments.of(
            TARGET_FIELDS,
            parse("{ \"id\": 123, \"name\": { \"first\": \"James\", \"surname\": \"Bond777!\"}}"),
            parse("{ \"id\": \"nnn\", \"name\": { \"first\": \"Xxxxx\", \"surname\": \"Xxxxnnn-\"}}")
        ),
        Arguments.of(
            TARGET_FIELDS,
            parse("[{ \"id\": 123, \"f2\": 234}, { \"name\": \"1.2\", \"f2\": 345} ]"),
            parse("[{ \"id\": \"nnn\", \"f2\": 234}, { \"name\": \"n-n\", \"f2\": 345} ]")
        ),
        Arguments.of(
            TARGET_FIELDS,
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Bond777!\"}}"),
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Xxxxnnn-\"}}")
        ),
        Arguments.of(
            List.of(),
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Bond777!\"}}"),
            parse("{ \"outer\": { \"f1\": \"Xxxxx\", \"name\": \"Xxxxnnn-\"}}")
        )
    );
  }

  @ParameterizedTest
  @CsvSource({
      "Some string?!1, Xxxx xxxxxx--n",
      "1.24343, n-nnnnn",
      "null, xxxx"
  })
  void testString(String original, String expected) {
    Mask policy = new Mask(List.of(), PATTERN);
    assertThat(policy.applyToString(original)).isEqualTo(expected);
  }

  @SneakyThrows
  private static JsonNode parse(String str) {
    return new JsonMapper().readTree(str);
  }
}