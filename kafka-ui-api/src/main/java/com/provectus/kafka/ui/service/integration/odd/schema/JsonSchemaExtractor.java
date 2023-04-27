package com.provectus.kafka.ui.service.integration.odd.schema;

import com.google.common.collect.ImmutableSet;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import org.everit.json.schema.ArraySchema;
import org.everit.json.schema.BooleanSchema;
import org.everit.json.schema.CombinedSchema;
import org.everit.json.schema.FalseSchema;
import org.everit.json.schema.NullSchema;
import org.everit.json.schema.NumberSchema;
import org.everit.json.schema.ObjectSchema;
import org.everit.json.schema.ReferenceSchema;
import org.everit.json.schema.Schema;
import org.everit.json.schema.StringSchema;
import org.everit.json.schema.TrueSchema;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.client.model.MetadataExtension;
import org.opendatadiscovery.oddrn.model.KafkaPath;

final class JsonSchemaExtractor {

  private JsonSchemaExtractor() {
  }

  static List<DataSetField> extract(JsonSchema jsonSchema, KafkaPath topicOddrn, boolean isKey) {
    Schema schema = jsonSchema.rawSchema();
    List<DataSetField> result = new ArrayList<>();
    result.add(DataSetFieldsExtractors.rootField(topicOddrn, isKey));
    extract(
        schema,
        topicOddrn.oddrn() + "/columns/" + (isKey ? "key" : "value"),
        null,
        null,
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
                              Boolean nullable,
                              ImmutableSet<String> registeredRecords,
                              List<DataSetField> sink) {
    if (schema instanceof ReferenceSchema s) {
      Optional.ofNullable(s.getReferredSchema())
          .ifPresent(refSchema -> extract(refSchema, parentOddr, oddrn, name, nullable, registeredRecords, sink));
    } else if (schema instanceof ObjectSchema s) {
      extractObject(s, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else if (schema instanceof ArraySchema s) {
      extractArray(s, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else if (schema instanceof CombinedSchema cs) {
      extractCombined(cs, parentOddr, oddrn, name, nullable, registeredRecords, sink);
    } else if (schema instanceof BooleanSchema
        || schema instanceof NumberSchema
        || schema instanceof StringSchema
        || schema instanceof NullSchema
    ) {
      extractPrimitive(schema, parentOddr, oddrn, name, nullable, sink);
    } else {
      extractUnknown(schema, parentOddr, oddrn, name, nullable, sink);
    }
  }

  private static void extractPrimitive(Schema schema,
                                       String parentOddr,
                                       String oddrn, //null for root
                                       String name,
                                       Boolean nullable,
                                       List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    sink.add(
        createDataSetField(
            schema,
            isRoot ? "Root JSON primitive" : name,
            parentOddr,
            isRoot ? (parentOddr + "/" + logicalTypeName(schema)) : oddrn,
            mapType(schema),
            logicalTypeName(schema),
            nullable
        )
    );
  }

  private static void extractUnknown(Schema schema,
                                     String parentOddr,
                                     String oddrn, //null for root
                                     String name,
                                     Boolean nullable,
                                     List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    sink.add(
        createDataSetField(
            schema,
            isRoot ? "Root type " + logicalTypeName(schema) : name,
            parentOddr,
            isRoot ? (parentOddr + "/" + logicalTypeName(schema)) : oddrn,
            DataSetFieldType.TypeEnum.UNKNOWN,
            logicalTypeName(schema),
            nullable
        )
    );
  }

  private static void extractObject(ObjectSchema schema,
                                    String parentOddr,
                                    String oddrn, //null for root
                                    String name,
                                    Boolean nullable,
                                    ImmutableSet<String> registeredRecords,
                                    List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    // schemaLocation can be null for empty object schemas (like if it used in anyOf)
    @Nullable var schemaLocation = schema.getSchemaLocation();
    if (!isRoot) {
      sink.add(createDataSetField(
          schema,
          name,
          parentOddr,
          oddrn,
          DataSetFieldType.TypeEnum.STRUCT,
          logicalTypeName(schema),
          nullable
      ));
      if (schemaLocation != null && registeredRecords.contains(schemaLocation)) {
        // avoiding recursion by checking if record already registered in parsing chain
        return;
      }
    }

    var newRegisteredRecords = schemaLocation == null
        ? registeredRecords
        : ImmutableSet.<String>builder()
        .addAll(registeredRecords)
        .add(schemaLocation)
        .build();

    schema.getPropertySchemas().forEach((propertyName, propertySchema) -> {
      boolean required = schema.getRequiredProperties().contains(propertyName);
      extract(
          propertySchema,
          isRoot ? parentOddr : oddrn,
          isRoot
              ? parentOddr + "/" + propertyName
              : oddrn + "/fields/" + propertyName,
          propertyName,
          !required,
          newRegisteredRecords,
          sink
      );
    });
  }

  private static void extractArray(ArraySchema schema,
                                   String parentOddr,
                                   String oddrn, //null for root
                                   String name,
                                   Boolean nullable,
                                   ImmutableSet<String> registeredRecords,
                                   List<DataSetField> sink) {
    boolean isRoot = oddrn == null;
    oddrn = isRoot ? parentOddr + "/array" : oddrn;
    if (isRoot) {
      sink.add(
          createDataSetField(
              schema,
              "Json array root",
              parentOddr,
              oddrn,
              DataSetFieldType.TypeEnum.LIST,
              "array",
              nullable
          ));
    } else {
      sink.add(
          createDataSetField(
              schema,
              name,
              parentOddr,
              oddrn,
              DataSetFieldType.TypeEnum.LIST,
              "array",
              nullable
          ));
    }
    @Nullable var itemsSchema = schema.getAllItemSchema();
    if (itemsSchema != null) {
      extract(
          itemsSchema,
          oddrn,
          oddrn + "/items/" + logicalTypeName(itemsSchema),
          logicalTypeName(itemsSchema),
          false,
          registeredRecords,
          sink
      );
    }
  }

  private static void extractCombined(CombinedSchema schema,
                                      String parentOddr,
                                      String oddrn, //null for root
                                      String name,
                                      Boolean nullable,
                                      ImmutableSet<String> registeredRecords,
                                      List<DataSetField> sink) {
    String combineType = "unknown";
    if (schema.getCriterion() == CombinedSchema.ALL_CRITERION) {
      combineType = "allOf";
    }
    if (schema.getCriterion() == CombinedSchema.ANY_CRITERION) {
      combineType = "anyOf";
    }
    if (schema.getCriterion() == CombinedSchema.ONE_CRITERION) {
      combineType = "oneOf";
    }

    boolean isRoot = oddrn == null;
    oddrn = isRoot ? (parentOddr + "/" + combineType) : (oddrn + "/" + combineType);
    sink.add(
        createDataSetField(
            schema,
            isRoot ? "Root %s".formatted(combineType) : name,
            parentOddr,
            oddrn,
            DataSetFieldType.TypeEnum.UNION,
            combineType,
            nullable
        ).addMetadataItem(new MetadataExtension()
            .schemaUrl(URI.create("wontbeused.oops"))
            .metadata(Map.of("criterion", combineType)))
    );

    for (Schema subschema : schema.getSubschemas()) {
      extract(
          subschema,
          oddrn,
          oddrn + "/values/" + logicalTypeName(subschema),
          logicalTypeName(subschema),
          nullable,
          registeredRecords,
          sink
      );
    }
  }

  private static String getDescription(Schema schema) {
    return Optional.ofNullable(schema.getTitle())
        .orElse(schema.getDescription());
  }

  private static String logicalTypeName(Schema schema) {
    return schema.getClass()
        .getSimpleName()
        .replace("Schema", "");
  }

  private static DataSetField createDataSetField(Schema schema,
                                                 String name,
                                                 String parentOddrn,
                                                 String oddrn,
                                                 DataSetFieldType.TypeEnum type,
                                                 String logicalType,
                                                 Boolean nullable) {
    return new DataSetField()
        .name(name)
        .parentFieldOddrn(parentOddrn)
        .oddrn(oddrn)
        .description(getDescription(schema))
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
    if (type instanceof BooleanSchema || type instanceof TrueSchema || type instanceof FalseSchema) {
      return DataSetFieldType.TypeEnum.BOOLEAN;
    }
    if (type instanceof ObjectSchema) {
      return DataSetFieldType.TypeEnum.STRUCT;
    }
    if (type instanceof ReferenceSchema s) {
      return mapType(s.getReferredSchema());
    }
    if (type instanceof CombinedSchema) {
      return DataSetFieldType.TypeEnum.UNION;
    }
    return DataSetFieldType.TypeEnum.UNKNOWN;
  }

}
