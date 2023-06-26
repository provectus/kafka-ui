package com.provectus.kafka.ui.util.jsonschema;

import static com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion.convertAvroToJson;
import static com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion.convertJsonToAvro;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.DoubleNode;
import com.fasterxml.jackson.databind.node.FloatNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.google.common.primitives.Longs;
import com.provectus.kafka.ui.exception.JsonAvroConversionException;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.SneakyThrows;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class JsonAvroConversionTest {

  // checking conversion from json to KafkaAvroSerializer-compatible avro objects
  @Nested
  class FromJsonToAvro {

    @Test
    void primitiveRoot() {
      assertThat(convertJsonToAvro("\"str\"", createSchema("\"string\"")))
          .isEqualTo("str");

      assertThat(convertJsonToAvro("123", createSchema("\"int\"")))
          .isEqualTo(123);

      assertThat(convertJsonToAvro("123", createSchema("\"long\"")))
          .isEqualTo(123L);

      assertThat(convertJsonToAvro("123.123", createSchema("\"float\"")))
          .isEqualTo(123.123F);

      assertThat(convertJsonToAvro("12345.12345", createSchema("\"double\"")))
          .isEqualTo(12345.12345);
    }

    @Test
    void primitiveTypedFields() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "f_int",
                     "type": "int"
                   },
                   {
                     "name": "f_long",
                     "type": "long"
                   },
                   {
                     "name": "f_string",
                     "type": "string"
                   },
                   {
                     "name": "f_boolean",
                     "type": "boolean"
                   },
                   {
                     "name": "f_float",
                     "type": "float"
                   },
                   {
                     "name": "f_double",
                     "type": "double"
                   },
                   {
                     "name": "f_enum",
                     "type" : {
                      "type": "enum",
                      "name": "Suit",
                      "symbols" : ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"]
                     }
                   },
                   {
                     "name" : "f_fixed",
                     "type" : { "type" : "fixed" ,"size" : 8, "name": "long_encoded" }
                   },
                   {
                     "name" : "f_bytes",
                     "type": "bytes"
                   }
                 ]
              }"""
      );

      String jsonPayload = """
          {
            "f_int": 123,
            "f_long": 4294967294,
            "f_string": "string here",
            "f_boolean": true,
            "f_float": 123.1,
            "f_double": 123456.123456,
            "f_enum": "SPADES",
            "f_fixed": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004Ò",
            "f_bytes": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\t)"
          }
          """;

      var converted = convertJsonToAvro(jsonPayload, schema);
      assertThat(converted).isInstanceOf(GenericData.Record.class);

      var record = (GenericData.Record) converted;
      assertThat(record.get("f_int")).isEqualTo(123);
      assertThat(record.get("f_long")).isEqualTo(4294967294L);
      assertThat(record.get("f_string")).isEqualTo("string here");
      assertThat(record.get("f_boolean")).isEqualTo(true);
      assertThat(record.get("f_float")).isEqualTo(123.1f);
      assertThat(record.get("f_double")).isEqualTo(123456.123456);
      assertThat(record.get("f_enum"))
          .isEqualTo(
              new GenericData.EnumSymbol(
                  schema.getField("f_enum").schema(),
                  "SPADES"
              )
          );
      assertThat(((GenericData.Fixed) record.get("f_fixed")).bytes()).isEqualTo(Longs.toByteArray(1234L));
      assertThat(((ByteBuffer) record.get("f_bytes")).array()).isEqualTo(Longs.toByteArray(2345L));
    }

    @Test
    void unionRoot() {
      var schema = createSchema("[ \"null\", \"string\", \"int\" ]");

      var converted = convertJsonToAvro("{\"string\":\"string here\"}", schema);
      assertThat(converted).isEqualTo("string here");

      converted = convertJsonToAvro("{\"int\": 123}", schema);
      assertThat(converted).isEqualTo(123);

      converted = convertJsonToAvro("null", schema);
      assertThat(converted).isEqualTo(null);
    }

    @Test
    void unionField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "namespace": "com.test",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "f_union",
                     "type": [ "null", "int", "TestAvroRecord"]
                   }
                 ]
              }"""
      );

      String jsonPayload = "{ \"f_union\": null }";

      var record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_union")).isNull();

      jsonPayload = "{ \"f_union\": { \"int\": 123 } }";
      record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_union")).isEqualTo(123);

      //short name can be used since there is no clash with other type names
      jsonPayload = "{ \"f_union\": { \"TestAvroRecord\": { \"f_union\": { \"int\": 123  } } } }";
      record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_union")).isInstanceOf(GenericData.Record.class);
      var innerRec = (GenericData.Record) record.get("f_union");
      assertThat(innerRec.get("f_union")).isEqualTo(123);

      assertThatThrownBy(() ->
          convertJsonToAvro("{ \"f_union\": { \"NotExistingType\": 123 } }", schema)
      ).isInstanceOf(JsonAvroConversionException.class);
    }

    @Test
    void unionFieldWithTypeNamesClash() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "namespace": "com.test",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "nestedClass",
                     "type": {
                       "type": "record",
                       "namespace": "com.nested",
                       "name": "TestAvroRecord",
                       "fields": [
                         {"name" : "inner_obj_field", "type": "int" }
                       ]
                     }
                   },
                   {
                     "name": "f_union",
                     "type": [ "null", "int", "com.test.TestAvroRecord", "com.nested.TestAvroRecord"]
                   }
                 ]
              }"""
      );
      //short name can't can be used since there is a clash with other type names
      var jsonPayload = "{ \"f_union\": { \"com.test.TestAvroRecord\": { \"f_union\": { \"int\": 123  } } } }";
      var record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_union")).isInstanceOf(GenericData.Record.class);
      var innerRec = (GenericData.Record) record.get("f_union");
      assertThat(innerRec.get("f_union")).isEqualTo(123);

      //short name can't can be used since there is a clash with other type names
      jsonPayload = "{ \"f_union\": { \"com.nested.TestAvroRecord\": { \"inner_obj_field\":  234 } } }";
      record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_union")).isInstanceOf(GenericData.Record.class);
      innerRec = (GenericData.Record) record.get("f_union");
      assertThat(innerRec.get("inner_obj_field")).isEqualTo(234);

      assertThatThrownBy(() ->
          convertJsonToAvro("{ \"f_union\": { \"TestAvroRecord\": { \"inner_obj_field\":  234 } } }", schema)
      ).isInstanceOf(JsonAvroConversionException.class);
    }

    @Test
    void mapField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "long_map",
                     "type": {
                       "type": "map",
                       "values" : "long",
                       "default": {}
                     }
                   },
                   {
                     "name": "string_map",
                     "type": {
                       "type": "map",
                       "values" : "string",
                       "default": {}
                     }
                   },
                   {
                     "name": "self_ref_map",
                     "type": {
                       "type": "map",
                       "values" : "TestAvroRecord",
                       "default": {}
                     }
                   }
                 ]
              }"""
      );

      String jsonPayload = """
          {
            "long_map": {
              "k1": 123,
              "k2": 456
            },
            "string_map": {
              "k3": "s1",
              "k4": "s2"
            },
            "self_ref_map": {
              "k5" : {
                "long_map": { "_k1": 222 },
                "string_map": { "_k2": "_s1" }
              }
            }
          }
          """;

      var record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("long_map"))
          .isEqualTo(Map.of("k1", 123L, "k2", 456L));
      assertThat(record.get("string_map"))
          .isEqualTo(Map.of("k3", "s1", "k4", "s2"));
      assertThat(record.get("self_ref_map"))
          .isNotNull();

      Map<String, Object> selfRefMapField = (Map<String, Object>) record.get("self_ref_map");
      assertThat(selfRefMapField)
          .hasSize(1)
          .hasEntrySatisfying("k5", v -> {
            assertThat(v).isInstanceOf(GenericData.Record.class);
            var innerRec = (GenericData.Record) v;
            assertThat(innerRec.get("long_map"))
                .isEqualTo(Map.of("_k1", 222L));
            assertThat(innerRec.get("string_map"))
                .isEqualTo(Map.of("_k2", "_s1"));
          });
    }

    @Test
    void arrayField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "f_array",
                     "type": {
                        "type": "array",
                        "items" : "string",
                        "default": []
                      }
                   }
                 ]
              }"""
      );

      String jsonPayload = """
          {
            "f_array": [ "e1", "e2" ]
          }
          """;

      var record = (GenericData.Record) convertJsonToAvro(jsonPayload, schema);
      assertThat(record.get("f_array")).isEqualTo(List.of("e1", "e2"));
    }

    @Test
    void logicalTypesField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "lt_date",
                     "type": { "type": "int", "logicalType": "date" }
                   },
                   {
                     "name": "lt_uuid",
                     "type": { "type": "string", "logicalType": "uuid" }
                   },
                   {
                     "name": "lt_decimal",
                     "type": { "type": "bytes", "logicalType": "decimal", "precision": 22, "scale":10 }
                   },
                   {
                     "name": "lt_time_millis",
                     "type": { "type": "int", "logicalType": "time-millis"}
                   },
                   {
                     "name": "lt_time_micros",
                     "type": { "type": "long", "logicalType": "time-micros"}
                   },
                   {
                     "name": "lt_timestamp_millis",
                     "type": { "type": "long", "logicalType": "timestamp-millis" }
                   },
                   {
                     "name": "lt_timestamp_micros",
                     "type": { "type": "long", "logicalType": "timestamp-micros" }
                   },
                   {
                     "name": "lt_local_timestamp_millis",
                     "type": { "type": "long", "logicalType": "local-timestamp-millis" }
                   },
                   {
                     "name": "lt_local_timestamp_micros",
                     "type": { "type": "long", "logicalType": "local-timestamp-micros" }
                   }
                 ]
              }"""
      );

      String jsonPayload = """
          {
            "lt_date":"1991-08-14",
            "lt_decimal": 2.1617413862327545E11,
            "lt_time_millis": "10:15:30.001",
            "lt_time_micros": "10:15:30.123456",
            "lt_uuid": "a37b75ca-097c-5d46-6119-f0637922e908",
            "lt_timestamp_millis": "2007-12-03T10:15:30.123Z",
            "lt_timestamp_micros": "2007-12-13T10:15:30.123456Z",
            "lt_local_timestamp_millis": "2017-12-03T10:15:30.123",
            "lt_local_timestamp_micros": "2017-12-13T10:15:30.123456"
          }
          """;

      var converted = convertJsonToAvro(jsonPayload, schema);
      assertThat(converted).isInstanceOf(GenericData.Record.class);

      var record = (GenericData.Record) converted;

      assertThat(record.get("lt_date"))
          .isEqualTo(LocalDate.of(1991, 8, 14));
      assertThat(record.get("lt_decimal"))
          .isEqualTo(new BigDecimal("2.1617413862327545E11"));
      assertThat(record.get("lt_time_millis"))
          .isEqualTo(LocalTime.parse("10:15:30.001"));
      assertThat(record.get("lt_time_micros"))
          .isEqualTo(LocalTime.parse("10:15:30.123456"));
      assertThat(record.get("lt_timestamp_millis"))
          .isEqualTo(Instant.parse("2007-12-03T10:15:30.123Z"));
      assertThat(record.get("lt_timestamp_micros"))
          .isEqualTo(Instant.parse("2007-12-13T10:15:30.123456Z"));
      assertThat(record.get("lt_local_timestamp_millis"))
          .isEqualTo(LocalDateTime.parse("2017-12-03T10:15:30.123"));
      assertThat(record.get("lt_local_timestamp_micros"))
          .isEqualTo(LocalDateTime.parse("2017-12-13T10:15:30.123456"));
    }
  }

  // checking conversion of KafkaAvroDeserializer output to JsonNode
  @Nested
  class FromAvroToJson {

    @Test
    void primitiveRoot() {
      assertThat(convertAvroToJson("str", createSchema("\"string\"")))
          .isEqualTo(new TextNode("str"));

      assertThat(convertAvroToJson(123, createSchema("\"int\"")))
          .isEqualTo(new IntNode(123));

      assertThat(convertAvroToJson(123L, createSchema("\"long\"")))
          .isEqualTo(new LongNode(123));

      assertThat(convertAvroToJson(123.1F, createSchema("\"float\"")))
          .isEqualTo(new FloatNode(123.1F));

      assertThat(convertAvroToJson(123.1, createSchema("\"double\"")))
          .isEqualTo(new DoubleNode(123.1));

      assertThat(convertAvroToJson(true, createSchema("\"boolean\"")))
          .isEqualTo(BooleanNode.valueOf(true));

      assertThat(convertAvroToJson(ByteBuffer.wrap(Longs.toByteArray(123L)), createSchema("\"bytes\"")))
          .isEqualTo(new TextNode(new String(Longs.toByteArray(123L), StandardCharsets.ISO_8859_1)));
    }

    @SneakyThrows
    @Test
    void primitiveTypedFields() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "f_int",
                     "type": "int"
                   },
                   {
                     "name": "f_long",
                     "type": "long"
                   },
                   {
                     "name": "f_string",
                     "type": "string"
                   },
                   {
                     "name": "f_boolean",
                     "type": "boolean"
                   },
                   {
                     "name": "f_float",
                     "type": "float"
                   },
                   {
                     "name": "f_double",
                     "type": "double"
                   },
                   {
                     "name": "f_enum",
                     "type" : {
                      "type": "enum",
                      "name": "Suit",
                      "symbols" : ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"]
                     }
                   },
                   {
                     "name" : "f_fixed",
                     "type" : { "type" : "fixed" ,"size" : 8, "name": "long_encoded" }
                   },
                   {
                     "name" : "f_bytes",
                     "type": "bytes"
                   }
                 ]
              }"""
      );

      byte[] fixedFieldValue = Longs.toByteArray(1234L);
      byte[] bytesFieldValue = Longs.toByteArray(2345L);

      GenericData.Record inputRecord = new GenericData.Record(schema);
      inputRecord.put("f_int", 123);
      inputRecord.put("f_long", 4294967294L);
      inputRecord.put("f_string", "string here");
      inputRecord.put("f_boolean", true);
      inputRecord.put("f_float", 123.1f);
      inputRecord.put("f_double", 123456.123456);
      inputRecord.put("f_enum", new GenericData.EnumSymbol(schema.getField("f_enum").schema(), "SPADES"));
      inputRecord.put("f_fixed", new GenericData.Fixed(schema.getField("f_fixed").schema(), fixedFieldValue));
      inputRecord.put("f_bytes", ByteBuffer.wrap(bytesFieldValue));

      String expectedJson = """
          {
            "f_int": 123,
            "f_long": 4294967294,
            "f_string": "string here",
            "f_boolean": true,
            "f_float": 123.1,
            "f_double": 123456.123456,
            "f_enum": "SPADES",
            "f_fixed": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004Ò",
            "f_bytes": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\t)"
          }
          """;

      assertJsonsEqual(expectedJson, convertAvroToJson(inputRecord, schema));
    }

    @Test
    void logicalTypesField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "lt_date",
                     "type": { "type": "int", "logicalType": "date" }
                   },
                   {
                     "name": "lt_uuid",
                     "type": { "type": "string", "logicalType": "uuid" }
                   },
                   {
                     "name": "lt_decimal",
                     "type": { "type": "bytes", "logicalType": "decimal", "precision": 22, "scale":10 }
                   },
                   {
                     "name": "lt_time_millis",
                     "type": { "type": "int", "logicalType": "time-millis"}
                   },
                   {
                     "name": "lt_time_micros",
                     "type": { "type": "long", "logicalType": "time-micros"}
                   },
                   {
                     "name": "lt_timestamp_millis",
                     "type": { "type": "long", "logicalType": "timestamp-millis" }
                   },
                   {
                     "name": "lt_timestamp_micros",
                     "type": { "type": "long", "logicalType": "timestamp-micros" }
                   },
                   {
                     "name": "lt_local_timestamp_millis",
                     "type": { "type": "long", "logicalType": "local-timestamp-millis" }
                   },
                   {
                     "name": "lt_local_timestamp_micros",
                     "type": { "type": "long", "logicalType": "local-timestamp-micros" }
                   }
                 ]
              }"""
      );

      GenericData.Record inputRecord = new GenericData.Record(schema);
      inputRecord.put("lt_date", LocalDate.of(1991, 8, 14));
      inputRecord.put("lt_uuid", UUID.fromString("a37b75ca-097c-5d46-6119-f0637922e908"));
      inputRecord.put("lt_decimal", new BigDecimal("2.16"));
      inputRecord.put("lt_time_millis", LocalTime.parse("10:15:30.001"));
      inputRecord.put("lt_time_micros", LocalTime.parse("10:15:30.123456"));
      inputRecord.put("lt_timestamp_millis", Instant.parse("2007-12-03T10:15:30.123Z"));
      inputRecord.put("lt_timestamp_micros", Instant.parse("2007-12-13T10:15:30.123456Z"));
      inputRecord.put("lt_local_timestamp_millis", LocalDateTime.parse("2017-12-03T10:15:30.123"));
      inputRecord.put("lt_local_timestamp_micros", LocalDateTime.parse("2017-12-13T10:15:30.123456"));

      String expectedJson = """
          {
            "lt_date":"1991-08-14",
            "lt_uuid": "a37b75ca-097c-5d46-6119-f0637922e908",
            "lt_decimal": 2.16,
            "lt_time_millis": "10:15:30.001",
            "lt_time_micros": "10:15:30.123456",
            "lt_timestamp_millis": "2007-12-03T10:15:30.123Z",
            "lt_timestamp_micros": "2007-12-13T10:15:30.123456Z",
            "lt_local_timestamp_millis": "2017-12-03T10:15:30.123",
            "lt_local_timestamp_micros": "2017-12-13T10:15:30.123456"
          }
          """;

      assertJsonsEqual(expectedJson, convertAvroToJson(inputRecord, schema));
    }

    @Test
    void unionField() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "namespace": "com.test",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "f_union",
                     "type": [ "null", "int", "TestAvroRecord"]
                   }
                 ]
              }"""
      );

      var r = new GenericData.Record(schema);
      r.put("f_union", null);
      assertJsonsEqual(" {}", convertAvroToJson(r, schema));

      r = new GenericData.Record(schema);
      r.put("f_union", 123);
      assertJsonsEqual(" { \"f_union\" : { \"int\" : 123 } }", convertAvroToJson(r, schema));


      r = new GenericData.Record(schema);
      var innerRec = new GenericData.Record(schema);
      innerRec.put("f_union", 123);
      r.put("f_union", innerRec);
      // short type name can be set since there is NO clash with other types name
      assertJsonsEqual(
          " { \"f_union\" : { \"TestAvroRecord\" : { \"f_union\" : { \"int\" : 123 } } } }",
          convertAvroToJson(r, schema)
      );
    }

    @Test
    void unionFieldWithInnerTypesNamesClash() {
      var schema = createSchema(
          """
               {
                 "type": "record",
                 "namespace": "com.test",
                 "name": "TestAvroRecord",
                 "fields": [
                   {
                     "name": "nestedClass",
                     "type": {
                       "type": "record",
                       "namespace": "com.nested",
                       "name": "TestAvroRecord",
                       "fields": [
                         {"name" : "inner_obj_field", "type": "int" }
                       ]
                     }
                   },
                   {
                     "name": "f_union",
                     "type": [ "null", "int", "com.test.TestAvroRecord", "com.nested.TestAvroRecord"]
                   }
                 ]
              }"""
      );

      var r = new GenericData.Record(schema);
      var innerRec = new GenericData.Record(schema);
      innerRec.put("f_union", 123);
      r.put("f_union", innerRec);
      // full type name should be set since there is a clash with other type name
      assertJsonsEqual(
          " { \"f_union\" : { \"com.test.TestAvroRecord\" : { \"f_union\" : { \"int\" : 123 } } } }",
          convertAvroToJson(r, schema)
      );
    }

  }

  private Schema createSchema(String schema) {
    return new AvroSchema(schema).rawSchema();
  }

  @SneakyThrows
  private void assertJsonsEqual(String expectedJson, JsonNode actual) {
    var mapper = new JsonMapper();
    assertThat(actual.toPrettyString())
        .isEqualTo(mapper.readTree(expectedJson).toPrettyString());
  }

}
