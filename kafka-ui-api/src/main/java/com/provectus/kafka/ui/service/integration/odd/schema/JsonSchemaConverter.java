package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import org.everit.json.schema.BooleanSchema;
import org.everit.json.schema.FalseSchema;
import org.everit.json.schema.NumberSchema;
import org.everit.json.schema.Schema;
import org.everit.json.schema.StringSchema;
import org.everit.json.schema.TrueSchema;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;
import org.springframework.boot.context.properties.bind.Binder;

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
        || schema instanceof StringSchema
        || schema instanceof TrueSchema
        || schema instanceof FalseSchema
    ) {
      String primOddrn = isRoot ? (parentOddr + "/" + typeName(schema)) : oddrn;
      sink.add(
          createDataSetField(
              isRoot ? "Root JSON primitive" : name,
              doc,
              parentOddr,
              primOddrn,
              mapType(schema),
              nullable
          )
      );
    }
  }

  private String typeName(Schema s) {
    return mapType(s).name().toLowerCase();
  }

  private static DataSetField createDataSetField(String name,
                                                 String parentOddrn,
                                                 String doc,
                                                 String oddrn,
                                                 DataSetFieldType.TypeEnum type,
                                                 String logicalType,
                                                 Boolean nullable) {

    Binder.get(null).bind("", Class.forName("")).
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

  private static DataSetFieldType.TypeEnum mapType(Schema type) {
    if (type instanceof NumberSchema) {
      return DataSetFieldType.TypeEnum.NUMBER;
    }
    if (type instanceof StringSchema) {
      return DataSetFieldType.TypeEnum.STRING;
    }
    if (type instanceof TrueSchema || type instanceof FalseSchema || type instanceof BooleanSchema) {
      return DataSetFieldType.TypeEnum.BOOLEAN;
    }
    return DataSetFieldType.TypeEnum.UNKNOWN;
  }

}
