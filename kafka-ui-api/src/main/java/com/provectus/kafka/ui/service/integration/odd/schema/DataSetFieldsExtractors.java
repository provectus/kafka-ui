package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.sr.model.SchemaType;
import java.util.List;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
public class DataSetFieldsExtractors {

  public static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn, boolean isKey) {
    SchemaType schemaType = Optional.ofNullable(subject.getSchemaType()).orElse(SchemaType.AVRO);
    return switch (schemaType) {
      case AVRO -> AvroExtractor.extract(subject, topicOddrn, isKey);
      case JSON -> JsonSchemaExtractor.extract(subject, topicOddrn, isKey);
      case PROTOBUF -> ProtoExtractor.extract(subject, topicOddrn, isKey);
    };
  }

}
