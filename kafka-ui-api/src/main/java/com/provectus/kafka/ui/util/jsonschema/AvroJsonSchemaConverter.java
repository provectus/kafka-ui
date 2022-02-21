package com.provectus.kafka.ui.util.jsonschema;

import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
    final FieldSchema root = convertSchema("root", schema, definitions, false);
    builder.definitions(definitions);

    if (type.getType().equals(JsonType.Type.OBJECT)) {
      final ObjectFieldSchema objectRoot = (ObjectFieldSchema) root;
      builder.properties(objectRoot.getProperties());
      builder.required(objectRoot.getRequired());
    }

    return builder.build();
  }


  private FieldSchema convertField(Schema.Field field, Map<String, FieldSchema> definitions) {
    return convertSchema(field.name(), field.schema(), definitions, true);
  }

  private FieldSchema convertSchema(String name, Schema schema,
                                    Map<String, FieldSchema> definitions, boolean ref) {
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
            return new MapFieldSchema(convertSchema(name, schema.getValueType(), definitions, ref));
          } else {
            return createObjectSchema(name, schema, definitions, ref);
          }
        case ARRAY:
          return createArraySchema(name, schema, definitions);
        default:
          throw new RuntimeException("Unknown type");
      }
    } else {
      return createUnionSchema(schema, definitions);
    }
  }

  private FieldSchema createUnionSchema(Schema schema, Map<String, FieldSchema> definitions) {

    final boolean nullable = schema.getTypes().stream()
        .anyMatch(t -> t.getType().equals(Schema.Type.NULL));

    final Map<String, FieldSchema> fields = schema.getTypes().stream()
        .filter(t -> !t.getType().equals(Schema.Type.NULL))
        .map(f -> Tuples.of(
            f.getType().getName().toLowerCase(Locale.ROOT),
            convertSchema(
                f.getType().getName().toLowerCase(Locale.ROOT),
                f, definitions, true
            )
        )).collect(Collectors.toMap(
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

  private FieldSchema createObjectSchema(String name, Schema schema,
                                         Map<String, FieldSchema> definitions, boolean ref) {
    final Map<String, FieldSchema> fields = schema.getFields().stream()
        .map(f -> Tuples.of(f.name(), convertField(f, definitions)))
        .collect(Collectors.toMap(
            Tuple2::getT1,
            Tuple2::getT2
        ));

    final List<String> required = schema.getFields().stream()
        .filter(f -> !f.schema().isNullable())
        .map(Schema.Field::name).collect(Collectors.toList());

    if (ref) {
      String definitionName = String.format("Record%s", schema.getName());
      definitions.put(definitionName, new ObjectFieldSchema(fields, required));
      return new RefFieldSchema(String.format("#/definitions/%s", definitionName));
    } else {
      return new ObjectFieldSchema(fields, required);
    }
  }

  private ArrayFieldSchema createArraySchema(String name, Schema schema,
                                             Map<String, FieldSchema> definitions) {
    return new ArrayFieldSchema(
        convertSchema(name, schema.getElementType(), definitions, true)
    );
  }

  private JsonType convertType(Schema schema) {
    switch (schema.getType()) {
      case INT:
      case LONG:
        return new SimpleJsonType(JsonType.Type.INTEGER);
      case MAP:
      case RECORD:
        return new SimpleJsonType(JsonType.Type.OBJECT);
      case ENUM:
        return new EnumJsonType(schema.getEnumSymbols());
      case BYTES:
      case STRING:
        return new SimpleJsonType(JsonType.Type.STRING);
      case NULL:
        return new SimpleJsonType(JsonType.Type.NULL);
      case ARRAY:
        return new SimpleJsonType(JsonType.Type.ARRAY);
      case FIXED:
      case FLOAT:
      case DOUBLE:
        return new SimpleJsonType(JsonType.Type.NUMBER);
      case BOOLEAN:
        return new SimpleJsonType(JsonType.Type.BOOLEAN);
      default:
        return new SimpleJsonType(JsonType.Type.STRING);
    }
  }
}
