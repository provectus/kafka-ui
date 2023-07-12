package com.provectus.kafka.ui.service.integration.odd.schema;

import static org.assertj.core.api.Assertions.assertThat;

import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.DataSetFieldType;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class ProtoExtractorTest {

  @ParameterizedTest
  @ValueSource(booleans = {true, false})
  void test(boolean isKey) {
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
        new ProtobufSchema(protoSchema),
        KafkaPath.builder()
            .cluster("localhost:9092")
            .topic("someTopic")
            .build(),
        isKey
    );

    String baseOddrn = "//kafka/cluster/localhost:9092/topics/someTopic/columns/" + (isKey ? "key" : "value");

    assertThat(list)
        .contains(
            DataSetFieldsExtractors.rootField(
                KafkaPath.builder().cluster("localhost:9092").topic("someTopic").build(),
                isKey
            ),
            new DataSetField()
                .name("mapField")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/mapField")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.LIST)
                        .logicalType("repeated")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("int32_field")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/int32_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("int32")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("enum_field")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/enum_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRING)
                        .logicalType("enum")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("ts_field")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/ts_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.DATETIME)
                        .logicalType("google.protobuf.Timestamp")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("duration_field")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/duration_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.DURATION)
                        .logicalType("google.protobuf.Duration")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("one_of_v1")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/one_of_v1")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.UNKNOWN)
                        .logicalType("google.protobuf.Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("one_of_v2")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/one_of_v2")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.UNKNOWN)
                        .logicalType("google.protobuf.Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("int64_w_field")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/int64_w_field")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("google.protobuf.Int64Value")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("emb")
                .parentFieldOddrn(baseOddrn)
                .oddrn(baseOddrn + "/emb")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRUCT)
                        .logicalType("test.TestMsg.EmbeddedMsg")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("emb_f1")
                .parentFieldOddrn(baseOddrn + "/emb")
                .oddrn(baseOddrn + "/emb/fields/emb_f1")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.INTEGER)
                        .logicalType("int32")
                        .isNullable(true)
                ),
            new DataSetField()
                .name("outer_ref")
                .parentFieldOddrn(baseOddrn + "/emb")
                .oddrn(baseOddrn + "/emb/fields/outer_ref")
                .type(
                    new DataSetFieldType()
                        .type(DataSetFieldType.TypeEnum.STRUCT)
                        .logicalType("test.TestMsg")
                        .isNullable(true)
                )
        );
  }

}
