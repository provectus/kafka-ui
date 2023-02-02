package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class ProtoConverterTest {

  @Test
  void test(){
    String protoSchema = """
        syntax = "proto3";
        package test;

        import "google/protobuf/timestamp.proto";
        import "google/protobuf/duration.proto";
        import "google/protobuf/struct.proto";
        import "google/protobuf/wrappers.proto";

        message TestMsg {
            map<string, int32> mapField = 100;
            string string_field = 1;
            int32 int32_field = 2;
            bool bool_field = 3;
            SampleEnum enum_field = 4;

            enum SampleEnum {
                ENUM_V1 = 0;
                ENUM_V2 = 1;
            }

            google.protobuf.Timestamp ts_field = 5;
            google.protobuf.Struct struct_field = 6;
            google.protobuf.ListValue lst_v_field = 7;
            google.protobuf.Duration duration_field = 8;

            oneof some_oneof1 {
                google.protobuf.Value v1 = 9;
                google.protobuf.Value v2 = 10;
            }
            // wrapper fields:
            google.protobuf.Int64Value int64_w_field = 11;
            google.protobuf.Int32Value int32_w_field = 12;
            google.protobuf.UInt64Value uint64_w_field = 13;
            google.protobuf.UInt32Value uint32_w_field = 14;
            google.protobuf.StringValue string_w_field = 15;
            google.protobuf.BoolValue bool_w_field = 16;
            google.protobuf.DoubleValue double_w_field = 17;
            google.protobuf.FloatValue float_w_field = 18;

            //embedded msg
            EmbeddedMsg emb = 19;
            repeated EmbeddedMsg emb_list = 20;

            message EmbeddedMsg {
                int32 emb_f1 = 1;
                TestMsg outer_ref = 2;
            }
        }""";

    var list = ProtoConverter.extract(
        new SchemaSubject()
            .schema(protoSchema),
        KafkaPath.builder()
            .host("localhost:9092")
            .topic("someTopic")
            .build()
    );
    System.out.println(list);
  }

}
