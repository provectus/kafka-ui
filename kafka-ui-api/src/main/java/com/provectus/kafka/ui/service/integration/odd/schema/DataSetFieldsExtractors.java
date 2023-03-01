package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.sr.model.SchemaType;
import java.util.List;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
public class DataSetFieldsExtractors {

  public List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn, boolean isKey) {
    SchemaType schemaType = Optional.ofNullable(subject.getSchemaType()).orElse(SchemaType.AVRO);
    return switch (schemaType) {
      case AVRO -> AvroExtractor.extract(subject, topicOddrn, isKey);
      case JSON -> JsonSchemaExtractor.extract(subject, topicOddrn, isKey);
      case PROTOBUF -> ProtoExtractor.extract(subject, topicOddrn, isKey);
    };
  }


  DataSetField rootField(KafkaPath topicOddrn, boolean isKey) {
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
