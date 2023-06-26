package com.provectus.kafka.ui.util.jsonschema;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.avro.Schema;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class AvroJsonSchemaConverter implements JsonSchemaConverter<Schema> {

  @Override
  public JsonSchema convert(URI basePath, Schema schema) {
    final JsonSchema.JsonSchemaBuilder builder = JsonSchema.builder();

    builder.id(basePath.resolve(schema.getName()));
    JsonType type = convertType(schema);
    builder.type(type);

    Map<String, FieldSchema> definitions = new HashMap<>();
    final FieldSchema root = convertSchema(schema, definitions, true);
    builder.definitions(definitions);

    if (type.getType().equals(JsonType.Type.OBJECT)) {
      final ObjectFieldSchema objectRoot = (ObjectFieldSchema) root;
      builder.properties(objectRoot.getProperties());
      builder.required(objectRoot.getRequired());
    }

    return builder.build();
  }


  private FieldSchema convertField(Schema.Field field, Map<String, FieldSchema> definitions) {
    return convertSchema(field.schema(), definitions, false);
  }

  private FieldSchema convertSchema(Schema schema,
                                    Map<String, FieldSchema> definitions, boolean isRoot) {
    Optional<FieldSchema> logicalTypeSchema = JsonAvroConversion.LogicalTypeConversion.getJsonSchema(schema);
    if (logicalTypeSchema.isPresent()) {
      return logicalTypeSchema.get();
    }
    if (!schema.isUnion()) {
      JsonType type = convertType(schema);
      switch (type.getType()) {
        case BOOLEAN:
        case NULL:
        case STRING:
        case ENUM:
        case NUMBER:
        case INTEGER:
          return new SimpleFieldSchema(type);
        case OBJECT:
          if (schema.getType().equals(Schema.Type.MAP)) {
            return new MapFieldSchema(convertSchema(schema.getValueType(), definitions, isRoot));
          } else {
            return createObjectSchema(schema, definitions, isRoot);
          }
        case ARRAY:
          return createArraySchema(schema, definitions);
        default:
          throw new RuntimeException("Unknown type");
      }
    } else {
      return createUnionSchema(schema, definitions);
    }
  }

  // this method formats json-schema field in a way
  // to fit avro-> json encoding rules (https://avro.apache.org/docs/1.11.1/specification/_print/#json-encoding)
  private FieldSchema createUnionSchema(Schema schema, Map<String, FieldSchema> definitions) {
    final boolean nullable = schema.getTypes().stream()
        .anyMatch(t -> t.getType().equals(Schema.Type.NULL));

    final Map<String, FieldSchema> fields = schema.getTypes().stream()
        .filter(t -> !t.getType().equals(Schema.Type.NULL))
        .map(f -> {
          String oneOfFieldName;
          if (f.getType().equals(Schema.Type.RECORD)) {
            // for records using full record name
            oneOfFieldName = f.getFullName();
          } else {
            // for primitive types - using type name
            oneOfFieldName = f.getType().getName().toLowerCase();
          }
          return Tuples.of(oneOfFieldName, convertSchema(f, definitions, false));
        }).collect(Collectors.toMap(
            Tuple2::getT1,
            Tuple2::getT2
        ));

    if (nullable) {
      return new OneOfFieldSchema(
          List.of(
              new SimpleFieldSchema(new SimpleJsonType(JsonType.Type.NULL)),
              new ObjectFieldSchema(fields, Collections.emptyList())
          )
      );
    } else {
      return new ObjectFieldSchema(fields, Collections.emptyList());
    }
  }

  private FieldSchema createObjectSchema(Schema schema,
                                         Map<String, FieldSchema> definitions,
                                         boolean isRoot) {
    var definitionName = schema.getFullName();
    if (definitions.containsKey(definitionName)) {
      return createRefField(definitionName);
    }
    // adding stub record, need to avoid infinite recursion
    definitions.put(definitionName, ObjectFieldSchema.EMPTY);

    final Map<String, FieldSchema> fields = schema.getFields().stream()
        .map(f -> Tuples.of(f.name(), convertField(f, definitions)))
        .collect(Collectors.toMap(
            Tuple2::getT1,
            Tuple2::getT2
        ));

    final List<String> required = schema.getFields().stream()
        .filter(f -> !f.schema().isNullable())
        .map(Schema.Field::name).collect(Collectors.toList());

    var objectSchema = new ObjectFieldSchema(fields, required);
    if (isRoot) {
      // replacing stub with self-reference (need for usage in json-schema's oneOf)
      definitions.put(definitionName, new RefFieldSchema("#"));
      return objectSchema;
    } else {
      // replacing stub record with actual object structure
      definitions.put(definitionName, objectSchema);
      return createRefField(definitionName);
    }
  }

  private RefFieldSchema createRefField(String definitionName) {
    return new RefFieldSchema(String.format("#/definitions/%s", definitionName));
  }

  private ArrayFieldSchema createArraySchema(Schema schema,
                                             Map<String, FieldSchema> definitions) {
    return new ArrayFieldSchema(
        convertSchema(schema.getElementType(), definitions, false)
    );
  }

  private JsonType convertType(Schema schema) {
    return switch (schema.getType()) {
      case INT, LONG -> new SimpleJsonType(JsonType.Type.INTEGER);
      case MAP, RECORD -> new SimpleJsonType(JsonType.Type.OBJECT);
      case ENUM -> new EnumJsonType(schema.getEnumSymbols());
      case BYTES, STRING -> new SimpleJsonType(JsonType.Type.STRING);
      case NULL -> new SimpleJsonType(JsonType.Type.NULL);
      case ARRAY -> new SimpleJsonType(JsonType.Type.ARRAY);
      case FIXED, FLOAT, DOUBLE -> new SimpleJsonType(JsonType.Type.NUMBER);
      case BOOLEAN -> new SimpleJsonType(JsonType.Type.BOOLEAN);
      default -> new SimpleJsonType(JsonType.Type.STRING);
    };
  }
}
