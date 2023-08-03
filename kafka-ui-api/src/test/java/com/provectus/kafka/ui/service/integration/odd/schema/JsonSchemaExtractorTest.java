package com.provectus.kafka.ui.service.integration.odd.schema;

import static org.assertj.core.api.Assertions.assertThat;

import io.confluent.kafka.schemaregistry.json.JsonSchema;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.client.model.MetadataExtension;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class JsonSchemaExtractorTest {

  @ParameterizedTest
  @ValueSource(booleans = {true, false})
  void test(boolean isKey) {
    String jsonSchema = """
        {
            "$id": "http://example.com/test.TestMsg",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "required": [ "int32_field" ],
            "properties":
            {
                "int32_field": { "type": "integer", "title": "field title" },
                "lst_s_field": { "type": "array", "items": { "type": "string" }, "description": "field descr" },
                "untyped_struct_field": { "type": "object", "properties": {} },
                "union_field": { "type": [ "number", "object", "null" ] },
                "struct_field": {
                    "type": "object",
                    "properties": {
                        "bool_field": { "type": "boolean" }
                    }
                }
            }
        }
        """;
    var fields = JsonSchemaExtractor.extract(
        new JsonSchema(jsonSchema),
        KafkaPath.builder()
            .cluster("localhost:9092")
            .topic("someTopic")
            .build(),
        isKey
    );

    String baseOddrn = "//kafka/cluster/localhost:9092/topics/someTopic/columns/" + (isKey ? "key" : "value");

    assertThat(fields).contains(
        DataSetFieldsExtractors.rootField(
            KafkaPath.builder().cluster("localhost:9092").topic("someTopic").build(),
            isKey
        ),
        new DataSetField()
            .name("int32_field")
            .parentFieldOddrn(baseOddrn)
            .oddrn(baseOddrn + "/int32_field")
            .description("field title")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.NUMBER)
                .logicalType("Number")
                .isNullable(false)),
        new DataSetField()
            .name("lst_s_field")
            .parentFieldOddrn(baseOddrn)
            .oddrn(baseOddrn + "/lst_s_field")
            .description("field descr")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.LIST)
                .logicalType("array")
                .isNullable(true)),
        new DataSetField()
            .name("String")
            .parentFieldOddrn(baseOddrn + "/lst_s_field")
            .oddrn(baseOddrn + "/lst_s_field/items/String")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRING)
                .logicalType("String")
                .isNullable(false)),
        new DataSetField()
            .name("untyped_struct_field")
            .parentFieldOddrn(baseOddrn)
            .oddrn(baseOddrn + "/untyped_struct_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("union_field")
            .parentFieldOddrn(baseOddrn)
            .oddrn(baseOddrn + "/union_field/anyOf")
            .metadata(List.of(new MetadataExtension()
                .schemaUrl(URI.create("wontbeused.oops"))
                .metadata(Map.of("criterion", "anyOf"))))
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.UNION)
                .logicalType("anyOf")
                .isNullable(true)),
        new DataSetField()
            .name("Number")
            .parentFieldOddrn(baseOddrn + "/union_field/anyOf")
            .oddrn(baseOddrn + "/union_field/anyOf/values/Number")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.NUMBER)
                .logicalType("Number")
                .isNullable(true)),
        new DataSetField()
            .name("Object")
            .parentFieldOddrn(baseOddrn + "/union_field/anyOf")
            .oddrn(baseOddrn + "/union_field/anyOf/values/Object")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("Null")
            .parentFieldOddrn(baseOddrn + "/union_field/anyOf")
            .oddrn(baseOddrn + "/union_field/anyOf/values/Null")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.UNKNOWN)
                .logicalType("Null")
                .isNullable(true)),
        new DataSetField()
            .name("struct_field")
            .parentFieldOddrn(baseOddrn)
            .oddrn(baseOddrn + "/struct_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("bool_field")
            .parentFieldOddrn(baseOddrn + "/struct_field")
            .oddrn(baseOddrn + "/struct_field/fields/bool_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.BOOLEAN)
                .logicalType("Boolean")
                .isNullable(true))
    );
  }
}
