package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.node.BigIntegerNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.LongNode;
import com.google.common.primitives.UnsignedInteger;
import com.google.common.primitives.UnsignedLong;
import com.google.protobuf.Any;
import com.google.protobuf.BoolValue;
import com.google.protobuf.BytesValue;
import com.google.protobuf.Descriptors;
import com.google.protobuf.DoubleValue;
import com.google.protobuf.Duration;
import com.google.protobuf.FieldMask;
import com.google.protobuf.FloatValue;
import com.google.protobuf.Int32Value;
import com.google.protobuf.Int64Value;
import com.google.protobuf.ListValue;
import com.google.protobuf.StringValue;
import com.google.protobuf.Struct;
import com.google.protobuf.Timestamp;
import com.google.protobuf.UInt32Value;
import com.google.protobuf.UInt64Value;
import com.google.protobuf.Value;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class ProtobufSchemaConverter implements JsonSchemaConverter<Descriptors.Descriptor> {

  private final Set<String> simpleTypesWrapperNames = Set.of(
      BoolValue.getDescriptor().getFullName(),
      Int32Value.getDescriptor().getFullName(),
      UInt32Value.getDescriptor().getFullName(),
      Int64Value.getDescriptor().getFullName(),
      UInt64Value.getDescriptor().getFullName(),
      StringValue.getDescriptor().getFullName(),
      BytesValue.getDescriptor().getFullName(),
      FloatValue.getDescriptor().getFullName(),
      DoubleValue.getDescriptor().getFullName()
  );

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

    final List<String> required = schema.getFields().stream()
        .filter(f -> !f.isOptional())
        .map(Descriptors.FieldDescriptor::getName).collect(Collectors.toList());

    if (ref) {
      String definitionName = String.format("record.%s", schema.getFullName());
      definitions.put(definitionName, new ObjectFieldSchema(fields, required));
      return new RefFieldSchema(String.format("#/definitions/%s", definitionName));
    } else {
      return new ObjectFieldSchema(fields, required);
    }
  }

  private FieldSchema convertField(Descriptors.FieldDescriptor field,
                                   Map<String, FieldSchema> definitions) {
    Optional<FieldSchema> wellKnownTypeSchema = convertProtoWellKnownTypes(field);
    if (wellKnownTypeSchema.isPresent()) {
      return wellKnownTypeSchema.get();
    }
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

  // converts Protobuf WellKnownType (from google.protobuf.* packages) to Json-schema types
  // see JsonFormat::buildWellKnownTypePrinters for impl details
  private Optional<FieldSchema> convertProtoWellKnownTypes(Descriptors.FieldDescriptor field) {
    if (field.getType() != Descriptors.FieldDescriptor.Type.MESSAGE) {
      return Optional.empty();
    }
    String typeName = field.getMessageType().getFullName();
    if (typeName.equals(Timestamp.getDescriptor().getFullName())
        || typeName.equals(Duration.getDescriptor().getFullName())
        || typeName.equals(FieldMask.getDescriptor().getFullName())) {
      return Optional.of(new SimpleFieldSchema(new SimpleJsonType(JsonType.Type.STRING)));
    }
    if (typeName.equals(Any.getDescriptor().getFullName())
        || typeName.equals(Struct.getDescriptor().getFullName())) {
      return Optional.of(new ObjectFieldSchema(Map.of(), List.of()));
    }
    if (typeName.equals(Value.getDescriptor().getFullName())) {
      return Optional.of(AnyFieldSchema.get());
    }
    if (typeName.equals(ListValue.getDescriptor().getFullName())) {
      return Optional.of(new ArrayFieldSchema(AnyFieldSchema.get()));
    }
    if (simpleTypesWrapperNames.contains(typeName)) {
      return Optional.of(new SimpleFieldSchema(
          convertType(field.getMessageType().findFieldByName("value"))));
    }
    return Optional.empty();
  }

  private JsonType convertType(Descriptors.FieldDescriptor field) {
    switch (field.getType()) {
      case INT32:
      case FIXED32:
      case SFIXED32:
      case SINT32:
        return new SimpleJsonType(
            JsonType.Type.INTEGER,
            Map.of(
                "maximum", IntNode.valueOf(Integer.MAX_VALUE),
                "minimum", IntNode.valueOf(Integer.MIN_VALUE)
            )
        );
      case UINT32:
        return new SimpleJsonType(
            JsonType.Type.INTEGER,
            Map.of(
                "maximum", LongNode.valueOf(UnsignedInteger.MAX_VALUE.longValue()),
                "minimum", IntNode.valueOf(0)
            )
        );
      //TODO: actually all *64 types will be printed with quotes (as strings),
      // see JsonFormat::printSingleFieldValue for impl. This can cause problems when you copy-paste from messages
      // table to `Produce` area - need to think if it is critical or not.
      case INT64:
      case FIXED64:
      case SFIXED64:
      case SINT64:
        return new SimpleJsonType(
            JsonType.Type.INTEGER,
            Map.of(
                "maximum", LongNode.valueOf(Long.MAX_VALUE),
                "minimum", LongNode.valueOf(Long.MIN_VALUE)
            )
        );
      case UINT64:
        return new SimpleJsonType(
            JsonType.Type.INTEGER,
            Map.of(
                "maximum", new BigIntegerNode(UnsignedLong.MAX_VALUE.bigIntegerValue()),
                "minimum", LongNode.valueOf(0)
            )
        );
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
