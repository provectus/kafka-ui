package com.provectus.kafka.ui.service.integration.odd.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class AvroExtractorTest {

  @Test
  void test() {
    var list = AvroExtractor.extract(
        new SchemaSubject()
            .schema("""
                {
                    "type": "record",
                    "name": "Message",
                    "namespace": "com.provectus.kafka",
                    "fields":
                    [
                        {
                            "name": "f1",
                            "type":
                            {
                                "type": "array",
                                "items":
                                {
                                    "type": "record",
                                    "name": "ArrElement",
                                    "fields":
                                    [
                                        {
                                            "name": "longmap",
                                            "type":
                                            {
                                                "type": "map",
                                                "values": "long"
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            "name": "f2",
                            "type":
                            {
                                "type": "record",
                                "name": "InnerMessage",
                                "fields":
                                [
                                    {
                                        "name": "text",
                                        "doc": "string field here",
                                        "type": "string"
                                    },
                                    {
                                        "name": "innerMsgRef",
                                        "type": "InnerMessage"
                                    },
                                    {
                                        "name": "nullable_union",
                                        "type":
                                        [
                                            "null",
                                            "string",
                                            "int"
                                        ],
                                        "default": null
                                    },
                                    {
                                        "name": "order_enum",
                                        "type":
                                        {
                                            "type": "enum",
                                            "name": "Suit",
                                            "symbols":
                                            [
                                                "SPADES",
                                                "HEARTS"
                                            ]
                                        }
                                    },
                                    {
                                        "name": "str_list",
                                        "type":
                                        {
                                            "type": "array",
                                            "items": "string"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
                """),

        KafkaPath.builder()
            .host("localhost:9092")
            .topic("someTopic")
            .build()
    );

    assertThat(list).contains(
        new DataSetField()
            .name("f1")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.LIST)
                    .logicalType("array")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("ArrElement")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRUCT)
                    .logicalType("com.provectus.kafka.ArrElement")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("longmap")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement/fields/longmap")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.MAP)
                    .logicalType("map")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("key")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement/fields/longmap")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement/fields/longmap/key")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRING)
                    .logicalType("string")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("value")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement/fields/longmap")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f1/items/ArrElement/fields/longmap/value")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.INTEGER)
                    .logicalType("long")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("f2")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRUCT)
                    .logicalType("com.provectus.kafka.InnerMessage")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("text")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/text")
            .description("string field here")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRING)
                    .logicalType("string")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("innerMsgRef")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/innerMsgRef")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRUCT)
                    .logicalType("com.provectus.kafka.InnerMessage")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("nullable_union")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.UNION)
                    .logicalType("union")
                    .isNullable(true)
            ),
        new DataSetField()
            .name("string")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union/values/string")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRING)
                    .logicalType("string")
                    .isNullable(true)
            ),
        new DataSetField()
            .name("int")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union/values/int")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.INTEGER)
                    .logicalType("int")
                    .isNullable(true)
            ),
        new DataSetField()
            .name("int")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/nullable_union/values/int")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.INTEGER)
                    .logicalType("int")
                    .isNullable(true)
            ),
        new DataSetField()
            .name("order_enum")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/order_enum")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRING)
                    .logicalType("enum")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("str_list")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/str_list")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.LIST)
                    .logicalType("array")
                    .isNullable(false)
            ),
        new DataSetField()
            .name("string")
            .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/str_list")
            .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/f2/fields/str_list/items/string")
            .type(
                new DataSetFieldType()
                    .type(DataSetFieldType.TypeEnum.STRING)
                    .logicalType("string")
                    .isNullable(false)
            )
    );
  }

}
