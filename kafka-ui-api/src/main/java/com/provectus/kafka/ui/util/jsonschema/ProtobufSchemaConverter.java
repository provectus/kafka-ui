package com.provectus.kafka.ui.util.jsonschema;

import com.google.protobuf.Descriptors;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class ProtobufSchemaConverter implements JsonSchemaConverter<Descriptors.Descriptor> {
  @Override
  public JsonSchema convert(URI basePath, Descriptors.Descriptor schema) {
    final JsonSchema.JsonSchemaBuilder builder = JsonSchema.builder();

    builder.id(basePath.resolve(schema.getFullName()));
    builder.type(new SimpleJsonType(JsonType.Type.OBJECT));

    Map<String, FieldSchema> definitions = new HashMap<>();
    final ObjectFieldSchema root =
        (ObjectFieldSchema) convertObjectSchema(schema, definitions, false);
    builder.definitions(definitions);

    builder.properties(root.getProperties());
    builder.required(root.getRequired());

    return builder.build();
  }

  private FieldSchema convertObjectSchema(Descriptors.Descriptor schema,
                                          Map<String, FieldSchema> definitions, boolean ref) {
    final Map<String, FieldSchema> fields = schema.getFields().stream()
        .map(f -> Tuples.of(f.getName(), convertField(f, definitions)))
        .collect(Collectors.toMap(
            Tuple2::getT1,
            Tuple2::getT2
        ));

    final Map<String, OneOfFieldSchema> oneOfFields = schema.getOneofs().stream().map(o ->
        Tuples.of(
            o.getName(),
            new OneOfFieldSchema(
                o.getFields().stream().map(
                    Descriptors.FieldDescriptor::getName
                ).map(fields::get).collect(Collectors.toList())
            )
        )
    ).collect(Collectors.toMap(
        Tuple2::getT1,
        Tuple2::getT2
    ));

    final List<String> allOneOfFields = schema.getOneofs().stream().flatMap(o ->
        o.getFields().stream().map(Descriptors.FieldDescriptor::getName)
    ).collect(Collectors.toList());

    final Map<String, FieldSchema> excludedOneOf = fields.entrySet().stream()
        .filter(f -> !allOneOfFields.contains(f.getKey()))
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue
        ));

    Map<String, FieldSchema> finalFields = new HashMap<>(excludedOneOf);
    finalFields.putAll(oneOfFields);

    final List<String> required = schema.getFields().stream()
        .filter(f -> !f.isOptional())
        .map(Descriptors.FieldDescriptor::getName).collect(Collectors.toList());

    if (ref) {
      String definitionName = String.format("record.%s", schema.getFullName());
      definitions.put(definitionName, new ObjectFieldSchema(finalFields, required));
      return new RefFieldSchema(String.format("#/definitions/%s", definitionName));
    } else {
      return new ObjectFieldSchema(fields, required);
    }
  }

  private FieldSchema convertField(Descriptors.FieldDescriptor field,
                                   Map<String, FieldSchema> definitions) {
    final JsonType jsonType = convertType(field);

    FieldSchema fieldSchema;
    if (jsonType.getType().equals(JsonType.Type.OBJECT)) {
      fieldSchema = convertObjectSchema(field.getMessageType(), definitions, true);
    } else {
      fieldSchema = new SimpleFieldSchema(jsonType);
    }

    if (field.isRepeated()) {
      return new ArrayFieldSchema(fieldSchema);
    } else {
      return fieldSchema;
    }
  }


  private JsonType convertType(Descriptors.FieldDescriptor field) {
    switch (field.getType()) {
      case INT32:
      case INT64:
      case SINT32:
      case SINT64:
      case UINT32:
      case UINT64:
      case FIXED32:
      case FIXED64:
      case SFIXED32:
      case SFIXED64:
        return new SimpleJsonType(JsonType.Type.INTEGER);
      case MESSAGE:
      case GROUP:
        return new SimpleJsonType(JsonType.Type.OBJECT);
      case ENUM:
        return new EnumJsonType(
            field.getEnumType().getValues().stream()
                .map(Descriptors.EnumValueDescriptor::getName)
                .collect(Collectors.toList())
        );
      case BYTES:
      case STRING:
        return new SimpleJsonType(JsonType.Type.STRING);
      case FLOAT:
      case DOUBLE:
        return new SimpleJsonType(JsonType.Type.NUMBER);
      case BOOL:
        return new SimpleJsonType(JsonType.Type.BOOLEAN);
      default:
        return new SimpleJsonType(JsonType.Type.STRING);
    }
  }
}
