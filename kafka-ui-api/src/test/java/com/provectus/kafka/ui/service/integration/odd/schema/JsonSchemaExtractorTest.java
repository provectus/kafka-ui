package com.provectus.kafka.ui.service.integration.odd.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class JsonSchemaExtractorTest {

  @Test
  void test() {
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
        new SchemaSubject().schema(jsonSchema),
        KafkaPath.builder()
            .host("localhost:9092")
            .topic("some-topic")
            .build()
    );

    assertThat(fields).contains(
        new DataSetField()
            .name("int32_field")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/int32_field")
            .description("field title")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.NUMBER)
                .logicalType("Number")
                .isNullable(false)),
        new DataSetField()
            .name("lst_s_field")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/lst_s_field")
            .description("field descr")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.LIST)
                .logicalType("array")
                .isNullable(true)),
        new DataSetField()
            .name("String")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns/lst_s_field")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/lst_s_field/items/String")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRING)
                .logicalType("String")
                .isNullable(false)),
        new DataSetField()
            .name("untyped_struct_field")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/untyped_struct_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("union_field (anyOf)")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.UNION)
                .logicalType("anyOf")
                .isNullable(true)),
        new DataSetField()
            .name("Number")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf/values/Number")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.NUMBER)
                .logicalType("Number")
                .isNullable(true)),
        new DataSetField()
            .name("Object")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf/values/Object")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("Null")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/union_field/anyOf/values/Null")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.UNKNOWN)
                .logicalType("Null")
                .isNullable(true)),
        new DataSetField()
            .name("struct_field")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/struct_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.STRUCT)
                .logicalType("Object")
                .isNullable(true)),
        new DataSetField()
            .name("bool_field")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/some-topic/columns/struct_field")
            .oddrn("//kafka/host/localhost:9092/topics/some-topic/columns/struct_field/fields/bool_field")
            .type(new DataSetFieldType()
                .type(DataSetFieldType.TypeEnum.BOOLEAN)
                .logicalType("Boolean")
                .isNullable(true))
    );
  }
}
