package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import java.util.ArrayList;
import java.util.List;
import org.apache.avro.Schema;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

public class AvroConverter {

  public List<DataSetField> extractAvro(SchemaSubject subject, KafkaPath topicOddrn) {
    var schema = new Schema.Parser().parse(subject.getSchema());
    List<DataSetField> result = new ArrayList<>();
    extract(schema, Oddrn.generateOddrn(topicOddrn, "topic"), null, "", "", false, result);
    return result;
  }

  private DataSetField createDataSetField(String name,
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

  private void extract(Schema schema,
                       String parentOddr,
                       String oddrnSuffix, //null for root
                       String name,
                       String doc,
                       Boolean nullable,
                       List<DataSetField> sink
  ) {
    boolean isRoot = oddrnSuffix == null;
    String newOddrn;
    if (isRoot) {
      newOddrn = parentOddr;
    } else {
      newOddrn = parentOddr + "/" + oddrnSuffix;
    }
    switch (schema.getType()) {
      case RECORD -> {
        if (!isRoot) {
          sink.add(createDataSetField(name, doc, parentOddr, newOddrn, schema, nullable));
        }
        schema.getFields().forEach(f ->
            extract(
                f.schema(),
                newOddrn,
                isRoot ? f.name() : "fields/" + f.name(),
                f.name(),
                f.doc(),
                false,
                sink
            ));
      }
      case UNION -> {
        boolean containsNull = schema.getTypes().stream().map(Schema::getType).anyMatch(t -> t == Schema.Type.NULL);
        //TODO[discuss]: how this approach will work with backw-compat check? ->
        // if it is not root and there is only 2 values for union (null and smth else)
        // we registering this field as optional without mentioning union
        if (!isRoot && containsNull && schema.getTypes().size() == 2) {
          extract(
              schema.getTypes().stream()
                  .filter(s -> s.getType() != Schema.Type.NULL)
                  .findFirst()
                  .orElseThrow(IllegalStateException::new),
              parentOddr,
              oddrnSuffix,
              name,
              doc,
              true,
              sink
          );
          return;
        }
        if (isRoot) {
          sink.add(createDataSetField("Avro root union", doc, parentOddr, newOddrn, schema, containsNull));
        } else {
          sink.add(createDataSetField(name, doc, parentOddr, newOddrn, schema, containsNull));
        }
        schema.getTypes()
            .stream()
            .filter(t -> t.getType() != Schema.Type.NULL)
            .forEach(typeSchema ->
                extract(
                    typeSchema,
                    newOddrn,
                    "values/" + typeSchema.getName(),
                    typeSchema.getName(),
                    typeSchema.getDoc(),
                    containsNull,
                    sink
                ));
      }
      case ARRAY -> {
        if (isRoot) {
          sink.add(createDataSetField("Avro root Array", doc, parentOddr, newOddrn, schema, nullable));
        } else {
          sink.add(createDataSetField(name, doc, parentOddr, newOddrn, schema, nullable));
        }
        extract(
            schema.getElementType(),
            newOddrn,
            "items/" + schema.getElementType().getName(),
            schema.getElementType().getName(),
            schema.getElementType().getDoc(),
            false,
            sink
        );
      }
      case MAP -> {
        //TODO
      }
      default -> {
        // primitive types
        if (isRoot) {
          sink.add(
              createDataSetField(
                  "Root avro" + schema.getType(),
                  doc, parentOddr, newOddrn, schema, nullable));
        } else {
          sink.add(createDataSetField(name, doc, parentOddr, newOddrn, schema, nullable));
        }
      }
    }
  }

  private DataSetFieldType.TypeEnum mapType(Schema.Type type) {
    return switch (type) {
      case INT, LONG -> DataSetFieldType.TypeEnum.INTEGER;
      case FLOAT, DOUBLE, FIXED -> DataSetFieldType.TypeEnum.NUMBER;
      case STRING, ENUM -> DataSetFieldType.TypeEnum.STRING;
      case BOOLEAN -> DataSetFieldType.TypeEnum.BOOLEAN;
      case BYTES -> DataSetFieldType.TypeEnum.BINARY;
      case ARRAY -> DataSetFieldType.TypeEnum.LIST;
      case RECORD -> DataSetFieldType.TypeEnum.STRUCT;
      case MAP -> DataSetFieldType.TypeEnum.MAP;
      case UNION -> DataSetFieldType.TypeEnum.UNION;
      case NULL -> DataSetFieldType.TypeEnum.UNKNOWN;
    };
  }

  private DataSetFieldType mapType(Schema schema, Boolean nullable) {
    return new DataSetFieldType()
        .logicalType(schema.getType().toString())
        .isNullable(nullable)
        .type(mapType(schema.getType()));
  }
}
