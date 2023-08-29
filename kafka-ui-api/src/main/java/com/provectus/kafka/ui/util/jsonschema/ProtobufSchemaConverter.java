package com.provectus.kafka.ui.util.jsonschema;

import static java.util.Objects.requireNonNull;

import com.fasterxml.jackson.databind.node.BigIntegerNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.TextNode;
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

  private static final String MAXIMUM = "maximum";
  private static final String MINIMUM = "minimum";

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
    Map<String, FieldSchema> definitions = new HashMap<>();
    RefFieldSchema rootRef = registerObjectAndReturnRef(schema, definitions);
    return JsonSchema.builder()
        .id(basePath.resolve(schema.getFullName()))
        .type(new SimpleJsonType(JsonType.Type.OBJECT))
        .rootRef(rootRef.getRef())
        .definitions(definitions)
        .build();
  }

  private RefFieldSchema registerObjectAndReturnRef(Descriptors.Descriptor schema,
                                                    Map<String, FieldSchema> definitions) {
    var definition = schema.getFullName();
    if (definitions.containsKey(definition)) {
      return createRefField(definition);
    }
    // adding stub record, need to avoid infinite recursion
    definitions.put(definition, ObjectFieldSchema.EMPTY);

    Map<String, FieldSchema> fields = schema.getFields().stream()
        .map(f -> Tuples.of(f.getName(), convertField(f, definitions)))
        .collect(Collectors.toMap(Tuple2::getT1, Tuple2::getT2));

    List<String> required = schema.getFields().stream()
        .filter(Descriptors.FieldDescriptor::isRequired)
        .map(Descriptors.FieldDescriptor::getName)
        .collect(Collectors.toList());

    // replacing stub record with actual object structure
    definitions.put(definition, new ObjectFieldSchema(fields, required));
    return createRefField(definition);
  }

  private RefFieldSchema createRefField(String definition) {
    return new RefFieldSchema("#/definitions/%s".formatted(definition));
  }

  private FieldSchema convertField(Descriptors.FieldDescriptor field,
                                   Map<String, FieldSchema> definitions) {
    Optional<FieldSchema> wellKnownTypeSchema = convertProtoWellKnownTypes(field);
    if (wellKnownTypeSchema.isPresent()) {
      return wellKnownTypeSchema.get();
    }
    if (field.isMapField()) {
      return new MapFieldSchema();
    }
    final JsonType jsonType = convertType(field);
    FieldSchema fieldSchema;
    if (jsonType.getType().equals(JsonType.Type.OBJECT)) {
      fieldSchema = registerObjectAndReturnRef(field.getMessageType(), definitions);
    } else {
      fieldSchema = new SimpleFieldSchema(jsonType);
    }

    if (field.isRepeated()) {
      return new ArrayFieldSchema(fieldSchema);
    } else {
      return fieldSchema;
    }
  }

  // converts Protobuf Well-known type (from google.protobuf.* packages) to Json-schema types
  // see JsonFormat::buildWellKnownTypePrinters for impl details
  private Optional<FieldSchema> convertProtoWellKnownTypes(Descriptors.FieldDescriptor field) {
    // all well-known types are messages
    if (field.getType() != Descriptors.FieldDescriptor.Type.MESSAGE) {
      return Optional.empty();
    }
    String typeName = field.getMessageType().getFullName();
    if (typeName.equals(Timestamp.getDescriptor().getFullName())) {
      return Optional.of(
          new SimpleFieldSchema(
              new SimpleJsonType(JsonType.Type.STRING, Map.of("format", new TextNode("date-time")))));
    }
    if (typeName.equals(Duration.getDescriptor().getFullName())) {
      return Optional.of(
          new SimpleFieldSchema(
              //TODO: current UI is failing when format=duration is set - need to fix this first
              new SimpleJsonType(JsonType.Type.STRING // , Map.of("format", new TextNode("duration"))
              )));
    }
    if (typeName.equals(FieldMask.getDescriptor().getFullName())) {
      return Optional.of(new SimpleFieldSchema(new SimpleJsonType(JsonType.Type.STRING)));
    }
    if (typeName.equals(Any.getDescriptor().getFullName()) || typeName.equals(Struct.getDescriptor().getFullName())) {
      return Optional.of(ObjectFieldSchema.EMPTY);
    }
    if (typeName.equals(Value.getDescriptor().getFullName())) {
      return Optional.of(AnyFieldSchema.get());
    }
    if (typeName.equals(ListValue.getDescriptor().getFullName())) {
      return Optional.of(new ArrayFieldSchema(AnyFieldSchema.get()));
    }
    if (simpleTypesWrapperNames.contains(typeName)) {
      return Optional.of(new SimpleFieldSchema(
          convertType(requireNonNull(field.getMessageType().findFieldByName("value")))));
    }
    return Optional.empty();
  }

  private JsonType convertType(Descriptors.FieldDescriptor field) {
    return switch (field.getType()) {
      case INT32, FIXED32, SFIXED32, SINT32 -> new SimpleJsonType(
          JsonType.Type.INTEGER,
          Map.of(
              MAXIMUM, IntNode.valueOf(Integer.MAX_VALUE),
              MINIMUM, IntNode.valueOf(Integer.MIN_VALUE)
          )
      );
      case UINT32 -> new SimpleJsonType(
          JsonType.Type.INTEGER,
          Map.of(
              MAXIMUM, LongNode.valueOf(UnsignedInteger.MAX_VALUE.longValue()),
              MINIMUM, IntNode.valueOf(0)
          )
      );
      //TODO: actually all *64 types will be printed with quotes (as strings),
      // see JsonFormat::printSingleFieldValue for impl. This can cause problems when you copy-paste from messages
      // table to `Produce` area - need to think if it is critical or not.
      case INT64, FIXED64, SFIXED64, SINT64 -> new SimpleJsonType(
          JsonType.Type.INTEGER,
          Map.of(
              MAXIMUM, LongNode.valueOf(Long.MAX_VALUE),
              MINIMUM, LongNode.valueOf(Long.MIN_VALUE)
          )
      );
      case UINT64 -> new SimpleJsonType(
          JsonType.Type.INTEGER,
          Map.of(
              MAXIMUM, new BigIntegerNode(UnsignedLong.MAX_VALUE.bigIntegerValue()),
              MINIMUM, LongNode.valueOf(0)
          )
      );
      case MESSAGE, GROUP -> new SimpleJsonType(JsonType.Type.OBJECT);
      case ENUM -> new EnumJsonType(
          field.getEnumType().getValues().stream()
              .map(Descriptors.EnumValueDescriptor::getName)
              .collect(Collectors.toList())
      );
      case BYTES, STRING -> new SimpleJsonType(JsonType.Type.STRING);
      case FLOAT, DOUBLE -> new SimpleJsonType(JsonType.Type.NUMBER);
      case BOOL -> new SimpleJsonType(JsonType.Type.BOOLEAN);
    };
  }
}
