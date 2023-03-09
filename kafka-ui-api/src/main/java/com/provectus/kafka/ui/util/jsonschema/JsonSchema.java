package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;
import lombok.SneakyThrows;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Data
@Builder
public class JsonSchema {
  private final URI id;
  private final URI schema = URI.create("https://json-schema.org/draft/2020-12/schema");
  private final String title;
  private final JsonType type;
  private final Map<String, FieldSchema> properties;
  private final Map<String, FieldSchema> definitions;
  private final List<String> required;
  private final String rootRef;

  public String toJson() {
    final ObjectMapper mapper = new ObjectMapper();
    final ObjectNode objectNode = mapper.createObjectNode();
    objectNode.set("$id", new TextNode(id.toString()));
    objectNode.set("$schema", new TextNode(schema.toString()));
    objectNode.setAll(type.toJsonNode(mapper));
    if (properties != null && !properties.isEmpty()) {
      objectNode.set("properties", mapper.valueToTree(
          properties.entrySet().stream()
              .map(e -> Tuples.of(e.getKey(), e.getValue().toJsonNode(mapper)))
              .collect(Collectors.toMap(
                  Tuple2::getT1,
                  Tuple2::getT2
              ))
      ));
      if (!required.isEmpty()) {
        objectNode.set("required", mapper.valueToTree(required));
      }
    }
    if (definitions != null && !definitions.isEmpty()) {
      objectNode.set("definitions", mapper.valueToTree(
          definitions.entrySet().stream()
              .map(e -> Tuples.of(e.getKey(), e.getValue().toJsonNode(mapper)))
              .collect(Collectors.toMap(
                  Tuple2::getT1,
                  Tuple2::getT2
              ))
      ));
    }
    if (rootRef != null) {
      objectNode.set("$ref", new TextNode(rootRef));
    }
    return objectNode.toString();
  }

  @SneakyThrows
  public static JsonSchema stringSchema() {
    return JsonSchema.builder()
        .id(new URI("http://unknown.unknown"))
        .type(new SimpleJsonType(JsonType.Type.STRING))
        .build();
  }
}
