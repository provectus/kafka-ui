package com.provectus.kafka.ui.service.integrations.odd;

import com.google.protobuf.Descriptors;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.sr.model.SchemaType;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.apache.avro.Schema;
import org.apache.avro.util.internal.JacksonUtils;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
class DataSetFieldsExtractor {

  static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn) {
    SchemaType schemaType = Optional.ofNullable(subject.getSchemaType()).orElse(SchemaType.AVRO);
    return switch (schemaType) {
      case AVRO -> extractAvro(subject, topicOddrn);
      case JSON -> extractJson(subject, topicOddrn);
      case PROTOBUF -> extractProto(subject, topicOddrn);
    };
  }

  private static KafkaPath childPath(KafkaPath path, String childName) {
    if (path.getColumn() != null) {
      return path.toBuilder().column(path.getColumn() + "/" + childName).build();
    }
    return path.toBuilder().column(childName).build();
  }

  private static List<DataSetField> extractAvro(SchemaSubject subject, KafkaPath topicOddrn) {
    var schema = new Schema.Parser().parse(subject.getSchema());

    List<DataSetField> result = new ArrayList<>();
    for (Schema.Field field : schema.getFields()) {
      extractAvro(field, topicOddrn, result);
    }
    return result;
  }

  private static void extractAvro(Schema.Field avroField, KafkaPath parentOddr, List<DataSetField> sink) {
    var fieldSchema = avroField.schema();
    KafkaPath fieldOddrn = childPath(parentOddr, avroField.name());

    DataSetField field = new DataSetField()
        .name(avroField.name())
        .parentFieldOddrn(parentOddr.getColumn() != null ? oddrnStr(parentOddr) : null)
        .oddrn(oddrnStr(fieldOddrn))
        .description(avroField.doc())
        .defaultValue(avroField.hasDefaultValue() ? JacksonUtils.toJsonNode(avroField.defaultVal()).toString() : null)
        .type(
            new DataSetFieldType()
                .logicalType(fieldSchema.getType().toString())
                .isNullable(fieldSchema.isNullable())
                .type(
                    switch (fieldSchema.getType()) {
                      case INT, LONG -> DataSetFieldType.TypeEnum.INTEGER;
                      case FLOAT, DOUBLE -> DataSetFieldType.TypeEnum.NUMBER;
                      case STRING, ENUM -> DataSetFieldType.TypeEnum.STRING;
                      case BOOLEAN -> DataSetFieldType.TypeEnum.BOOLEAN;
                      case BYTES -> DataSetFieldType.TypeEnum.BINARY;
                      case ARRAY -> DataSetFieldType.TypeEnum.LIST;
                      case RECORD -> DataSetFieldType.TypeEnum.STRUCT;
                      case MAP -> DataSetFieldType.TypeEnum.MAP;
                      case UNION -> DataSetFieldType.TypeEnum.UNION;
                      case NULL, FIXED -> DataSetFieldType.TypeEnum.UNKNOWN;
                    }
                ));

    sink.add(field);

//    if (fieldSchema.getType() == Schema.Type.RECORD) {
//      fieldSchema.getFields().forEach(f -> extractAvro(f, fieldOddrn, sink));
//    } else if (fieldSchema.getType() == Schema.Type.UNION) {
//      fieldSchema.getTypes().forEach(unionType -> {
//        //TODO ???
//      });
//    }
  }

  private static List<DataSetField> extractProto(SchemaSubject subject, KafkaPath topicOddrn) {
    Descriptors.Descriptor schema = new ProtobufSchema(subject.getSchema()).toDescriptor();

    List<DataSetField> result = new ArrayList<>();
    for (Descriptors.FieldDescriptor field : schema.getFields()) {
      extractProtoField(field, topicOddrn, result);
    }
    return result;
  }

  private static void extractProtoField(Descriptors.FieldDescriptor protoField,
                                        KafkaPath parentOddrn,
                                        List<DataSetField> sink) {
    KafkaPath fieldOddrn = childPath(parentOddrn, protoField.getName());

    DataSetFieldType.TypeEnum fieldType;
    if (protoField.isMapField()) {
      fieldType = DataSetFieldType.TypeEnum.MAP;
    } else if (protoField.isRepeated()) {
      fieldType = DataSetFieldType.TypeEnum.LIST;
    } else {
      fieldType = switch (protoField.getType()) {
        case INT32, INT64, SINT32, SINT64, UINT64, UINT32, FIXED32, FIXED64, SFIXED32, SFIXED64 ->
            DataSetFieldType.TypeEnum.INTEGER;
        case FLOAT, DOUBLE -> DataSetFieldType.TypeEnum.NUMBER;
        case STRING, ENUM -> DataSetFieldType.TypeEnum.STRING;
        case BOOL -> DataSetFieldType.TypeEnum.BOOLEAN;
        case BYTES -> DataSetFieldType.TypeEnum.BINARY;
        case MESSAGE, GROUP -> DataSetFieldType.TypeEnum.STRUCT;
      };
    }

    DataSetField field = new DataSetField()
        .name(protoField.getName())
        .parentFieldOddrn(parentOddrn.getColumn() != null ? oddrnStr(parentOddrn) : null)
        .oddrn(oddrnStr(fieldOddrn))
        .defaultValue(
            protoField.hasDefaultValue() ? String.valueOf(protoField.getDefaultValue()) : null) //TODO check default
        .type(
            new DataSetFieldType()
                .logicalType(protoField.getType().name())
                .isNullable(protoField.isOptional())
                .type(fieldType)
        );

    sink.add(field);

    if (protoField.getType() == Descriptors.FieldDescriptor.Type.MESSAGE) {
      protoField.getMessageType().getFields().forEach(f -> extractProtoField(f, fieldOddrn, sink));
    }
  }

  private static List<DataSetField> extractJson(SchemaSubject subject, KafkaPath topicOddrn) {
    var schema = new JsonSchema(subject.getSchema()).rawSchema();
//    List<DataSetField> result = new ArrayList<>();
//    for (Descriptors.FieldDescriptor field : schema) {
//      extractProtoField(field, topicOddrn, result);
//    }
    return List.of();
  }

  @SneakyThrows
  private static String oddrnStr(KafkaPath path) {
    if (path.getColumn() == null) {
      return new Generator().generate(path, "topic");
    }
    return new Generator().generate(path, "column");
  }

}
