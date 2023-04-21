package com.provectus.kafka.ui.util.jsonschema;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.net.URI;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;


class ProtobufSchemaConverterTest {

  @Test
  void testSchemaConvert() throws Exception {
    String protoSchema = """
        syntax = "proto3";
        package test;

        import "google/protobuf/timestamp.proto";
        import "google/protobuf/duration.proto";
        import "google/protobuf/struct.proto";
        import "google/protobuf/wrappers.proto";

        message TestMsg {
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
                EmbeddedMsg self_ref = 3;
            }

            map<int32, string> intToStringMap = 21;
            map<string, EmbeddedMsg> strToObjMap  = 22;
        }""";

    String expectedJsonSchema = """
        {
            "$id": "http://example.com/test.TestMsg",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "definitions":
            {
                "test.TestMsg":
                {
                    "type": "object",
                    "properties":
                    {
                        "enum_field": {
                            "enum":
                            [
                                "ENUM_V1",
                                "ENUM_V2"
                            ],
                            "type": "string"
                        },
                        "string_w_field": { "type": "string" },
                        "ts_field": { "type": "string", "format": "date-time" },
                        "emb_list": {
                            "type": "array",
                            "items": { "$ref": "#/definitions/test.TestMsg.EmbeddedMsg" }
                        },
                        "float_w_field": { "type": "number" },
                        "lst_v_field": {
                            "type": "array",
                            "items": { "type":[ "number", "string", "object", "array", "boolean", "null" ] }
                        },
                        "struct_field": { "type": "object", "properties": {} },
                        "string_field": { "type": "string" },
                        "double_w_field": { "type": "number" },
                        "bool_field": { "type": "boolean" },
                        "int32_w_field": { "type": "integer", "maximum": 2147483647, "minimum": -2147483648 },
                        "duration_field": { "type": "string" },
                        "int32_field": { "type": "integer", "maximum": 2147483647, "minimum": -2147483648 },
                        "int64_w_field": {
                            "type": "integer",
                            "maximum": 9223372036854775807, "minimum": -9223372036854775808
                        },
                        "v1": { "type": [ "number", "string", "object", "array", "boolean", "null" ] },
                        "emb": { "$ref": "#/definitions/test.TestMsg.EmbeddedMsg" },
                        "v2": { "type": [ "number", "string", "object", "array", "boolean", "null" ] },
                        "uint32_w_field": { "type": "integer", "maximum": 4294967295, "minimum": 0 },
                        "bool_w_field": { "type": "boolean" },
                        "uint64_w_field": { "type": "integer", "maximum": 18446744073709551615, "minimum": 0 },
                        "strToObjMap": { "type": "object", "additionalProperties": true },
                        "intToStringMap": { "type": "object", "additionalProperties": true }
                    }
                },
                "test.TestMsg.EmbeddedMsg": {
                    "type": "object",
                    "properties":
                    {
                        "emb_f1": { "type": "integer", "maximum": 2147483647, "minimum": -2147483648 },
                        "outer_ref": { "$ref": "#/definitions/test.TestMsg" },
                        "self_ref": { "$ref": "#/definitions/test.TestMsg.EmbeddedMsg" }
                    }
                }
            },
            "$ref": "#/definitions/test.TestMsg"
        }""";

    ProtobufSchemaConverter converter = new ProtobufSchemaConverter();
    ProtobufSchema protobufSchema = new ProtobufSchema(protoSchema);
    URI basePath = new URI("http://example.com/");

    JsonSchema converted = converter.convert(basePath, protobufSchema.toDescriptor());
    assertJsonEqual(expectedJsonSchema, converted.toJson());
  }

  private void assertJsonEqual(String expected, String actual) throws Exception {
    ObjectMapper om = new ObjectMapper();
    Assertions.assertEquals(om.readTree(expected), om.readTree(actual));
  }
}
