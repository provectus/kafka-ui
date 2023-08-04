package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.collect.ImmutableSet;
import com.google.protobuf.BoolValue;
import com.google.protobuf.BytesValue;
import com.google.protobuf.Descriptors;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DoubleValue;
import com.google.protobuf.Duration;
import com.google.protobuf.FloatValue;
import com.google.protobuf.Int32Value;
import com.google.protobuf.Int64Value;
import com.google.protobuf.StringValue;
import com.google.protobuf.Timestamp;
import com.google.protobuf.UInt32Value;
import com.google.protobuf.UInt64Value;
import com.google.protobuf.Value;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.client.model.DataSetFieldType.TypeEnum;
import org.opendatadiscovery.oddrn.model.KafkaPath;

final class ProtoExtractor {

  private static final Set<String> PRIMITIVES_WRAPPER_TYPE_NAMES = Set.of(
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

  private ProtoExtractor() {
  }

  static List<DataSetField> extract(ProtobufSchema protobufSchema, KafkaPath topicOddrn, boolean isKey) {
    Descriptor schema = protobufSchema.toDescriptor();
    List<DataSetField> result = new ArrayList<>();
    result.add(DataSetFieldsExtractors.rootField(topicOddrn, isKey));
    var rootOddrn = topicOddrn.oddrn() + "/columns/" + (isKey ? "key" : "value");
    schema.getFields().forEach(f ->
        extract(f,
            rootOddrn,
            rootOddrn + "/" + f.getName(),
            f.getName(),
            !f.isRequired(),
            f.isRepeated(),
            ImmutableSet.of(schema.getFullName()),
            result
        ));
    return result;
  }

  private static void extract(Descriptors.FieldDescriptor field,
                              String parentOddr,
                              String oddrn, //null for root
                              String name,
                              boolean nullable,
                              boolean repeated,
                              ImmutableSet<String> registeredRecords,
                              List<DataSetField> sink) {
    if (repeated) {
      extractRepeated(field, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else if (field.getType() == Descriptors.FieldDescriptor.Type.MESSAGE) {
      extractMessage(field, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else {
      extractPrimitive(field, parentOddr, oddrn, name, nullable, sink);
    }
  }

  // converts some(!) Protobuf Well-known type (from google.protobuf.* packages)
  // see JsonFormat::buildWellKnownTypePrinters for impl details
  private static boolean extractProtoWellKnownType(Descriptors.FieldDescriptor field,
                                                   String parentOddr,
                                                   String oddrn, //null for root
                                                   String name,
                                                   boolean nullable,
                                                   List<DataSetField> sink) {
    // all well-known types are messages
    if (field.getType() != Descriptors.FieldDescriptor.Type.MESSAGE) {
      return false;
    }
    String typeName = field.getMessageType().getFullName();
    if (typeName.equals(Timestamp.getDescriptor().getFullName())) {
      sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.DATETIME, typeName, nullable));
      return true;
    }
    if (typeName.equals(Duration.getDescriptor().getFullName())) {
      sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.DURATION, typeName, nullable));
      return true;
    }
    if (typeName.equals(Value.getDescriptor().getFullName())) {
      //TODO: use ANY type when it will appear in ODD
      sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.UNKNOWN, typeName, nullable));
      return true;
    }
    if (PRIMITIVES_WRAPPER_TYPE_NAMES.contains(typeName)) {
      var wrapped = field.getMessageType().findFieldByName("value");
      sink.add(createDataSetField(name, parentOddr, oddrn, mapType(wrapped.getType()), typeName, true));
      return true;
    }
    return false;
  }

  private static void extractRepeated(Descriptors.FieldDescriptor field,
                                      String parentOddr,
                                      String oddrn, //null for root
                                      String name,
                                      boolean nullable,
                                      ImmutableSet<String> registeredRecords,
                                      List<DataSetField> sink) {
    sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.LIST, "repeated", nullable));

    String itemName = field.getType() == Descriptors.FieldDescriptor.Type.MESSAGE
        ? field.getMessageType().getName()
        : field.getType().name().toLowerCase();

    extract(
        field,
        oddrn,
        oddrn + "/items/" + itemName,
        itemName,
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
    if (extractProtoWellKnownType(field, parentOddr, oddrn, name, nullable, sink)) {
      return;
    }
    sink.add(createDataSetField(name, parentOddr, oddrn, TypeEnum.STRUCT, getLogicalTypeName(field), nullable));

    String msgTypeName = field.getMessageType().getFullName();
    if (registeredRecords.contains(msgTypeName)) {
      // avoiding recursion by checking if record already registered in parsing chain
      return;
    }
    var newRegisteredRecords = ImmutableSet.<String>builder()
        .addAll(registeredRecords)
        .add(msgTypeName)
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
                                       boolean nullable,
                                       List<DataSetField> sink) {
    sink.add(
        createDataSetField(
            name,
            parentOddr,
            oddrn,
            mapType(field.getType()),
            getLogicalTypeName(field),
            nullable
        )
    );
  }

  private static String getLogicalTypeName(Descriptors.FieldDescriptor f) {
    return f.getType() == Descriptors.FieldDescriptor.Type.MESSAGE
        ? f.getMessageType().getFullName()
        : f.getType().name().toLowerCase();
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
