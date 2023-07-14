package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.sr.model.SchemaType;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

public final class DataSetFieldsExtractors {

  public static List<DataSetField> extract(SchemaSubject subject,
                                           Map<String, String> resolvedRefs,
                                           KafkaPath topicOddrn,
                                           boolean isKey) {
    SchemaType schemaType = Optional.ofNullable(subject.getSchemaType()).orElse(SchemaType.AVRO);
    return switch (schemaType) {
      case AVRO -> AvroExtractor.extract(
          new AvroSchema(subject.getSchema(), List.of(), resolvedRefs, null), topicOddrn, isKey);
      case JSON -> JsonSchemaExtractor.extract(
          new JsonSchema(subject.getSchema(), List.of(), resolvedRefs, null), topicOddrn, isKey);
      case PROTOBUF -> ProtoExtractor.extract(
          new ProtobufSchema(subject.getSchema(), List.of(), resolvedRefs, null, null), topicOddrn, isKey);
    };
  }


  static DataSetField rootField(KafkaPath topicOddrn, boolean isKey) {
    var rootOddrn = topicOddrn.oddrn() + "/columns/" + (isKey ? "key" : "value");
    return new DataSetField()
        .name(isKey ? "key" : "value")
        .description("Topic's " + (isKey ? "key" : "value") + " schema")
        .parentFieldOddrn(topicOddrn.oddrn())
        .oddrn(rootOddrn)
        .type(new DataSetFieldType()
            .type(DataSetFieldType.TypeEnum.STRUCT)
            .isNullable(true));
  }

}
