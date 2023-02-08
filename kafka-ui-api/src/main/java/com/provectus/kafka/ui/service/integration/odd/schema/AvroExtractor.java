package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.service.integration.odd.Oddrn;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import org.apache.avro.Schema;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

@UtilityClass
class AvroExtractor {

  static List<DataSetField> extract(SchemaSubject subject, KafkaPath topicOddrn, boolean isKey) {
    var schema = new Schema.Parser().parse(subject.getSchema());
    List<DataSetField> result = new ArrayList<>();
    extract(
        schema,
        Oddrn.generateOddrn(topicOddrn, "topic") + "/columns/" + (isKey ? "key" : "value"),
        null,
        null,
        null,
        false,
        ImmutableSet.of(),
        result
    );
    return result;
  }

  private void extract(Schema schema,
                              String parentOddr,
                              String oddrn, //null for root
                              String name,
                              String doc,
                              Boolean nullable,
                              ImmutableSet<String> registeredRecords,
                              List<DataSetField> sink
  ) {
    switch (schema.getType()) {
      case RECORD -> extractRecord(schema, parentOddr, oddrn, name, doc, nullable, registeredRecords, sink);
      case UNION -> extractUnion(schema, parentOddr, oddrn, name, doc, registeredRecords, sink);
      case ARRAY -> extractArray(schema, parentOddr, oddrn, name, doc, nullable, registeredRecords, sink);
      case MAP -> extractMap(schema, parentOddr, oddrn, name, doc, nullable, registeredRecords, sink);
      default -> extractPrimitive(schema, parentOddr, oddrn, name, doc, nullable, sink);
    }
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
        .type(mapSchema(schema, nullable));
  }

  private void extractRecord(Schema schema,
                                    String parentOddr,
                                    String oddrn, //null for root
                                    String name,
                                    String doc,
                                    Boolean nullable,
                                    ImmutableSet<String> registeredRecords,
                                    List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    if (!isRoot) {
      sink.add(createDataSetField(name, doc, parentOddr, oddrn, schema, nullable));
      if (registeredRecords.contains(schema.getFullName())) {
        // avoiding recursion by checking if record already registered in parsing chain
        return;
      }
    }
    var newRegisteredRecords = ImmutableSet.<String>builder()
        .addAll(registeredRecords)
        .add(schema.getFullName())
        .build();

    schema.getFields().forEach(f ->
        extract(
            f.schema(),
            isRoot ? parentOddr : oddrn,
            isRoot
                ? parentOddr + "/" + f.name()
                : oddrn + "/fields/" + f.name(),
            f.name(),
            f.doc(),
            false,
            newRegisteredRecords,
            sink
        ));
  }

  private void extractUnion(Schema schema,
                                   String parentOddr,
                                   String oddrn, //null for root
                                   String name,
                                   String doc,
                                   ImmutableSet<String> registeredRecords,
                                   List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    boolean containsNull = schema.getTypes().stream().map(Schema::getType).anyMatch(t -> t == Schema.Type.NULL);
    // if it is not root and there is only 2 values for union (null and smth else)
    // we registering this field as optional without mentioning union
    if (!isRoot && containsNull && schema.getTypes().size() == 2) {
      var nonNullSchema = schema.getTypes().stream()
          .filter(s -> s.getType() != Schema.Type.NULL)
          .findFirst()
          .orElseThrow(IllegalStateException::new);
      extract(
          nonNullSchema,
          parentOddr,
          oddrn,
          name,
          doc,
          true,
          registeredRecords,
          sink
      );
      return;
    }
    oddrn = isRoot ? parentOddr + "/union" : oddrn;
    if (isRoot) {
      sink.add(createDataSetField("Avro root union", doc, parentOddr, oddrn, schema, containsNull));
    } else {
      sink.add(createDataSetField(name, doc, parentOddr, oddrn, schema, containsNull));
    }
    for (Schema t : schema.getTypes()) {
      if (t.getType() != Schema.Type.NULL) {
        extract(
            t,
            oddrn,
            oddrn + "/values/" + t.getName(),
            t.getName(),
            t.getDoc(),
            containsNull,
            registeredRecords,
            sink
        );
      }
    }
  }

  private void extractArray(Schema schema,
                                   String parentOddr,
                                   String oddrn, //null for root
                                   String name,
                                   String doc,
                                   Boolean nullable,
                                   ImmutableSet<String> registeredRecords,
                                   List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    oddrn = isRoot ? parentOddr + "/array" : oddrn;
    if (isRoot) {
      sink.add(createDataSetField("Avro root Array", doc, parentOddr, oddrn, schema, nullable));
    } else {
      sink.add(createDataSetField(name, doc, parentOddr, oddrn, schema, nullable));
    }
    extract(
        schema.getElementType(),
        oddrn,
        oddrn + "/items/" + schema.getElementType().getName(),
        schema.getElementType().getName(),
        schema.getElementType().getDoc(),
        false,
        registeredRecords,
        sink
    );
  }

  private void extractMap(Schema schema,
                                 String parentOddr,
                                 String oddrn, //null for root
                                 String name,
                                 String doc,
                                 Boolean nullable,
                                 ImmutableSet<String> registeredRecords,
                                 List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    oddrn = isRoot ? parentOddr + "/map" : oddrn;
    if (isRoot) {
      sink.add(createDataSetField("Avro root map", doc, parentOddr, oddrn, schema, nullable));
    } else {
      sink.add(createDataSetField(name, doc, parentOddr, oddrn, schema, nullable));
    }
    extract(
        new Schema.Parser().parse("\"string\""),
        oddrn,
        oddrn + "/key",
        "key",
        null,
        nullable,
        registeredRecords,
        sink
    );
    extract(
        schema.getValueType(),
        oddrn,
        oddrn + "/value",
        "value",
        null,
        nullable,
        registeredRecords,
        sink
    );
  }


  private void extractPrimitive(Schema schema,
                                       String parentOddr,
                                       String oddrn, //null for root
                                       String name,
                                       String doc,
                                       Boolean nullable,
                                       List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    String primOddrn = isRoot ? (parentOddr + "/" + schema.getType()) : oddrn;
    if (isRoot) {
      sink.add(createDataSetField("Root avro " + schema.getType(),
          doc, parentOddr, primOddrn, schema, nullable));
    } else {
      sink.add(createDataSetField(name, doc, parentOddr, primOddrn, schema, nullable));
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

  private DataSetFieldType mapSchema(Schema schema, Boolean nullable) {
    return new DataSetFieldType()
        .logicalType(logicalType(schema))
        .isNullable(nullable)
        .type(mapType(schema.getType()));
  }

  private String logicalType(Schema schema) {
    return schema.getType() == Schema.Type.RECORD
        ? schema.getFullName()
        : schema.getType().toString().toLowerCase();
  }

}
