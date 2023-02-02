package com.provectus.kafka.ui.service.integration.odd.schema;

import static java.util.Objects.requireNonNull;

import com.fasterxml.jackson.databind.node.TextNode;
import com.google.common.collect.ImmutableSet;
import com.google.protobuf.Any;
import com.google.protobuf.Descriptors;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.Duration;
import com.google.protobuf.FieldMask;
import com.google.protobuf.ListValue;
import com.google.protobuf.Struct;
import com.google.protobuf.Timestamp;
import com.google.protobuf.Value;
import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.util.jsonschema.AnyFieldSchema;
import com.provectus.kafka.ui.util.jsonschema.ArrayFieldSchema;
import com.provectus.kafka.ui.util.jsonschema.FieldSchema;
import com.provectus.kafka.ui.util.jsonschema.JsonType;
import com.provectus.kafka.ui.util.jsonschema.ObjectFieldSchema;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import com.provectus.kafka.ui.util.jsonschema.SimpleFieldSchema;
import com.provectus.kafka.ui.util.jsonschema.SimpleJsonType;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.client.model.DataSetFieldType.TypeEnum;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
class ProtoConverter {

  static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn) {
    Descriptor schema = new ProtobufSchema(subject.getSchema()).toDescriptor();

    String rootOddrn = Oddrn.generateOddrn(topicOddrn, "topic") + "/columns";
    List<DataSetField> result = new ArrayList<>();
    schema.getFields().forEach(f -> {
      extract(f,
          rootOddrn,
          rootOddrn + "/" + f.getName(),
          f.getName(),
          !f.isRequired(),
          f.isRepeated(),
          ImmutableSet.of(), result);
    });
    return result;
  }

  private static void extract(Descriptors.FieldDescriptor field,
                              String parentOddr,
                              String oddrn, //null for root
                              String name,
                              boolean nullable,
                              boolean repeated,
                              ImmutableSet<String> registeredRecords,
                              List<DataSetField> sink
  ) {
    if (repeated) {
      extractRepeated(field, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else if (field.getType() == Descriptors.FieldDescriptor.Type.MESSAGE) {
      extractMessage(field, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else {
      extractPrimitive(field, parentOddr, oddrn, name, nullable, sink);
    }
  }

  // converts Protobuf Well-known type (from google.protobuf.* packages) to Json-schema types
  // see JsonFormat::buildWellKnownTypePrinters for impl details
//  private boolean convertProtoWellKnownTypes(Descriptors.FieldDescriptor field,
//                                             String parentOddr,
//                                             String oddrn, //null for root
//                                             String name,
//                                             boolean nullable,
//                                             boolean repeated,
//                                             ImmutableSet<String> registeredRecords,
//                                             List<DataSetField> sink) {
//    // all well-known types are messages
//    if (field.getType() != Descriptors.FieldDescriptor.Type.MESSAGE) {
//      return false;
//    }
//    String typeName = field.getMessageType().getFullName();
//    if (typeName.equals(Timestamp.getDescriptor().getFullName())) {
//      sink.add(
//          createDataSetField(name, parentOddr, oddrn, TypeEnum.STRING, "well-known-proto-timestamp", nullable));
//      return true;
//    }
//    if (typeName.equals(Duration.getDescriptor().getFullName())) {
//      sink.add(
//          createDataSetField(name, parentOddr, oddrn, TypeEnum.STRING, "well-known-proto-duration", nullable));
//      return true;
//    }
//    if (typeName.equals(FieldMask.getDescriptor().getFullName())) {
//      return Optional.of(new SimpleFieldSchema(new SimpleJsonType(JsonType.Type.STRING)));
//    }
//    if (typeName.equals(Any.getDescriptor().getFullName()) || typeName.equals(Struct.getDescriptor().getFullName())) {
//      return Optional.of(ObjectFieldSchema.EMPTY);
//    }
//    if (typeName.equals(Value.getDescriptor().getFullName())) {
//      return Optional.of(AnyFieldSchema.get());
//    }
//    if (typeName.equals(ListValue.getDescriptor().getFullName())) {
//      return Optional.of(new ArrayFieldSchema(AnyFieldSchema.get()));
//    }
//    if (ProtobufSchemaConverter.SIMPLE_TYPES_WRAPPER_NAMES.contains(typeName)) {
//      return Optional.of(new SimpleFieldSchema(
//          convertType(requireNonNull(field.getMessageType().findFieldByName("value")))));
//    }
//    return Optional.empty();
//  }

  private static void extractRepeated(Descriptors.FieldDescriptor field,
                                      String parentOddr,
                                      String oddrn, //null for root
                                      String name,
                                      boolean nullable,
                                      ImmutableSet<String> registeredRecords,
                                      List<DataSetField> sink) {
    sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.LIST, "repeated", nullable));
    extract(
        field,
        oddrn,
        oddrn + "/items/" + typeName(field),
        typeName(field),
        nullable,
        false,
        registeredRecords,
        sink
    );
  }

  private static void extractMessage(Descriptors.FieldDescriptor field,
                                     String parentOddr,
                                     String oddrn, //null for root
                                     String name,
                                     boolean nullable,
                                     ImmutableSet<String> registeredRecords,
                                     List<DataSetField> sink) {
    sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.STRUCT, "message", nullable));
    if (registeredRecords.contains(field.getFullName())) {
      // avoiding recursion by checking if record already registered in parsing chain
      return;
    }
    var newRegisteredRecords = ImmutableSet.<String>builder()
        .addAll(registeredRecords)
        .add(field.getFullName())
        .build();

    field.getMessageType()
        .getFields()
        .forEach(f -> {
          extract(f,
              oddrn,
              oddrn + "/fields/" + f.getName(),
              f.getName(),
              !f.isRequired(),
              f.isRepeated(),
              newRegisteredRecords,
              sink
          );
        });
  }

  private static void extractPrimitive(Descriptors.FieldDescriptor field,
                                       String parentOddr,
                                       String oddrn,
                                       String name,
                                       boolean nullable, List<DataSetField> sink) {
    sink.add(
        createDataSetField(
            name,
            parentOddr,
            oddrn,
            mapType(field.getType()),
            typeName(field),
            nullable
        )
    );
  }


  private static String typeName(Descriptors.FieldDescriptor f) {
    return f.getType() == Descriptors.FieldDescriptor.Type.MESSAGE
        ? f.getMessageType().getName()
        : f.getType().toProto().name().toLowerCase();
  }

  private static DataSetField createDataSetField(String name,
                                                 String parentOddrn,
                                                 String oddrn,
                                                 TypeEnum type,
                                                 String logicalType,
                                                 Boolean nullable) {
    return new DataSetField()
        .name(name)
        .parentFieldOddrn(parentOddrn)
        .oddrn(oddrn)
        .type(
            new DataSetFieldType()
                .isNullable(nullable)
                .logicalType(logicalType)
                .type(type)
        );
  }


  private static TypeEnum mapType(Descriptors.FieldDescriptor.Type type) {
    return switch (type) {
      case INT32, INT64, SINT32, SFIXED32, SINT64, UINT32, UINT64, FIXED32, FIXED64, SFIXED64 -> TypeEnum.INTEGER;
      case FLOAT, DOUBLE -> TypeEnum.NUMBER;
      case STRING, ENUM -> TypeEnum.STRING;
      case BOOL -> TypeEnum.BOOLEAN;
      case BYTES -> TypeEnum.BINARY;
      case MESSAGE, GROUP -> TypeEnum.STRUCT;
    };
  }

}
