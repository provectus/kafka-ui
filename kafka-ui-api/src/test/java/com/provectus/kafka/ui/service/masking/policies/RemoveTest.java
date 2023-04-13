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

  private static final FieldsSelector FIELDS_SELECTOR = fieldName -> List.of("id", "name").contains(fieldName);

  @ParameterizedTest
  @MethodSource
  void testApplyToJsonContainer(FieldsSelector fieldsSelector, ContainerNode<?> original, ContainerNode<?>  expected) {
    var policy = new Remove(fieldsSelector);
    assertThat(policy.applyToJsonContainer(original)).isEqualTo(expected);
  }

  private static Stream<Arguments> testApplyToJsonContainer() {
    return Stream.of(
        Arguments.of(
            FIELDS_SELECTOR,
            parse("{ \"id\": 123, \"name\": { \"first\": \"James\", \"surname\": \"Bond777!\"}}"),
            parse("{}")
        ),
        Arguments.of(
            FIELDS_SELECTOR,
            parse("[{ \"id\": 123, \"f2\": 234}, { \"name\": \"1.2\", \"f2\": 345} ]"),
            parse("[{ \"f2\": 234}, { \"f2\": 345} ]")
        ),
        Arguments.of(
            FIELDS_SELECTOR,
            parse("{ \"outer\": { \"f1\": \"James\", \"name\": \"Bond777!\"}}"),
            parse("{ \"outer\": { \"f1\": \"James\"}}")
        ),
        Arguments.of(
            (FieldsSelector) (fieldName -> true),
            parse("{ \"outer\": { \"f1\": \"v1\", \"f2\": \"v2\", \"inner\" : {\"if1\": \"iv1\"}}}"),
            parse("{}")
        ),
        Arguments.of(
            (FieldsSelector) (fieldName -> true),
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
  void testApplyToString(String original, String expected) {
    var policy = new Remove(fieldName -> true);
    assertThat(policy.applyToString(original)).isEqualTo(expected);
  }
}
