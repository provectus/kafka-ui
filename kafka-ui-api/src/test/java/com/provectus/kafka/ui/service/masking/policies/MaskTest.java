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

  private static final FieldsSelector FIELDS_SELECTOR = fieldName -> List.of("id", "name").contains(fieldName);
  private static final List<String> PATTERN = List.of("X", "x", "n", "-");

  @ParameterizedTest
  @MethodSource
  void testApplyToJsonContainer(FieldsSelector selector, ContainerNode<?> original, ContainerNode<?> expected) {
    Mask policy = new Mask(selector, PATTERN);
    assertThat(policy.applyToJsonContainer(original)).isEqualTo(expected);
  }

  private static Stream<Arguments> testApplyToJsonContainer() {
    return Stream.of(
        Arguments.of(
            FIELDS_SELECTOR,
            parse("{ \"id\": 123, \"name\": { \"first\": \"James\", \"surname\": \"Bond777!\"}}"),
            parse("{ \"id\": \"nnn\", \"name\": { \"first\": \"Xxxxx\", \"surname\": \"Xxxxnnn-\"}}")
        ),
        Arguments.of(
            FIELDS_SELECTOR,
            parse("[{ \"id\": 123, \"f2\": 234}, { \"name\": \"1.2\", \"f2\": 345} ]"),
            parse("[{ \"id\": \"nnn\", \"f2\": 234}, { \"name\": \"n-n\", \"f2\": 345} ]")
        ),
        Arguments.of(
            FIELDS_SELECTOR,
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Bond777!\"}}"),
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Xxxxnnn-\"}}")
        ),
        Arguments.of(
            (FieldsSelector) (fieldName -> true),
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
  void testApplyToString(String original, String expected) {
    Mask policy = new Mask(fieldName -> true, PATTERN);
    assertThat(policy.applyToString(original)).isEqualTo(expected);
  }

  @SneakyThrows
  private static JsonNode parse(String str) {
    return new JsonMapper().readTree(str);
  }
}
