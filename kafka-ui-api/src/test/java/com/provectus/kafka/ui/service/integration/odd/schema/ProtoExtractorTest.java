package com.provectus.kafka.ui.service.integration.odd.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class ProtoExtractorTest {

  @Test
  void test() {
    String protoSchema = """
        syntax = "proto3";
        package test;

        import "google/protobuf/timestamp.proto";
        import "google/protobuf/duration.proto";
        import "google/protobuf/struct.proto";
        import "google/protobuf/wrappers.proto";

        message TestMsg {
            map<string, int32> mapField = 100;
            int32 int32_field = 2;
            bool bool_field = 3;
            SampleEnum enum_field = 4;

            enum SampleEnum {
                ENUM_V1 = 0;
                ENUM_V2 = 1;
            }

            google.protobuf.Timestamp ts_field = 5;
            google.protobuf.Duration duration_field = 8;

            oneof some_oneof1 {
                google.protobuf.Value one_of_v1 = 9;
                google.protobuf.Value one_of_v2 = 10;
            }
            // wrapper field:
            google.protobuf.Int64Value int64_w_field = 11;

            //embedded msg
            EmbeddedMsg emb = 19;

            message EmbeddedMsg {
                int32 emb_f1 = 1;
                TestMsg outer_ref = 2;
            }
        }""";

    var list = ProtoExtractor.extract(
        new SchemaSubject()
            .schema(protoSchema),
        KafkaPath.builder()
            .host("localhost:9092")
            .topic("someTopic")
            .build()
    );

    assertThat(list)
        .contains(
            new DataSetField()
                .name("mapField")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/mapField")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.LIST)
                        .logicalType("repeated")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("int32_field")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/int32_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("int32")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("enum_field")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/enum_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRING)
                        .logicalType("enum")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("ts_field")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/ts_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.DATETIME)
                        .logicalType("google.protobuf.Timestamp")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("duration_field")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/duration_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.DURATION)
                        .logicalType("google.protobuf.Duration")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("one_of_v1")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/one_of_v1")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.UNION)
                        .logicalType("google.protobuf.Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("one_of_v2")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/one_of_v2")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.UNION)
                        .logicalType("google.protobuf.Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("int64_w_field")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/int64_w_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("google.protobuf.Int64Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("emb")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/emb")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRUCT)
                        .logicalType("test.TestMsg.EmbeddedMsg")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("emb_f1")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/emb")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/emb/fields/emb_f1")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("int32")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("outer_ref")
                .parentFieldOddrn("//kafka/host/localhost:9092/topics/someTopic/columns/emb")
                .oddrn("//kafka/host/localhost:9092/topics/someTopic/columns/emb/fields/outer_ref")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRUCT)
                        .logicalType("test.TestMsg")
                        .isNullable(true)
                )
        );
  }

}
