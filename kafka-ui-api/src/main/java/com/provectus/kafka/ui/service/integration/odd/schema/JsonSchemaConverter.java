package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import org.everit.json.schema.BooleanSchema;
import org.everit.json.schema.NumberSchema;
import org.everit.json.schema.Schema;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
class JsonSchemaConverter {

  static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn) {
    Schema schema = new JsonSchema(subject.getSchema()).rawSchema();
    List<DataSetField> result = new ArrayList<>();
    extract(
        schema,
        Oddrn.generateOddrn(topicOddrn, "topic") + "/columns",
        null,
        null,
        schema.getDescription(),
        null,
        ImmutableSet.of(),
        result
    );
    return result;
  }

  private static void extract(Schema schema,
                              String parentOddr,
                              String oddrn, //null for root
                              String name,
                              String doc,
                              Boolean nullable,
                              ImmutableSet<String> registeredRecords,
                              List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    if (schema instanceof BooleanSchema
        || schema instanceof NumberSchema
        || schema instanceof Schema
    ) {
      String primOddrn = isRoot ? (parentOddr + "/" + typeName(schema)) : oddrn;
      sink.add(
          createDataSetField(
              "Root primitive",
              doc,
              parentOddr,
              primOddrn,
              schema,
              nullable
          )
      );
    }
  }

  private String typeName(Schema s) {
    return mapType(s).name().toLowerCase();
  }

  private static DataSetField createDataSetField(String name,
                                                 String doc,
                                                 String parentOddrn,
                                                 String oddrn,
                                                 Schema schema,
                                                 Boolean nullable) {
    return new DataSetField()
        .name(name)
        .description(doc)
        .parentFieldOddrn(parentOddrn)
        .oddrn(oddrn)
        .description(doc)
        .type(mapType(schema, nullable));
  }

  private static DataSetFieldType.TypeEnum mapType(Schema type) {
    if (type instanceof BooleanSchema) {
      return DataSetFieldType.TypeEnum.BOOLEAN;
    }
    return DataSetFieldType.TypeEnum.UNKNOWN;
  }

  private static DataSetFieldType mapType(Schema schema, Boolean nullable) {
    return new DataSetFieldType()
        .isNullable(nullable)
        .type(mapType(schema));
  }

}
