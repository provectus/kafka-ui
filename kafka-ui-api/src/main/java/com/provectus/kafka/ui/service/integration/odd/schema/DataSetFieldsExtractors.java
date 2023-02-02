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

  public static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn) {
    SchemaType schemaType = Optional.ofNullable(subject.getSchemaType()).orElse(SchemaType.AVRO);
    return switch (schemaType) {
      case AVRO -> AvroConverter.extract(subject, topicOddrn);
      case JSON -> JsonSchemaConverter.extract(subject, topicOddrn);
      case PROTOBUF -> ProtoConverter.extract(subject, topicOddrn);
    };
  }

}
