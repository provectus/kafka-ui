package com.provectus.kafka.ui.util.jsonschema;

import static com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion.convert;
import static org.assertj.core.api.Assertions.assertThat;

import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.junit.jupiter.api.Test;

class JsonAvroConversionTest {

  @Test
  void primitiveRoot() {
    assertThat(convert("\"str\"", createSchema("\"string\"")))
        .isEqualTo("str");

    assertThat(convert("123", createSchema("\"int\"")))
        .isEqualTo(123);

    assertThat(convert("123", createSchema("\"long\"")))
        .isEqualTo(123L);

    assertThat(convert("123.123", createSchema("\"float\"")))
        .isEqualTo(123.123F);

    assertThat(convert("12345.12345", createSchema("\"double\"")))
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
          "f_enum": "SPADES"
        }
        """;

    var converted = convert(jsonPayload, schema);
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
  }

  @Test
  void unionRoot() {
    var sc = createSchema("[ \"null\", \"string\", \"int\" ]");

    var converted = convert("{\"string\":\"string here\"}", sc);
    assertThat(converted).isEqualTo("string here");

    converted = convert("{\"int\": 123}", sc);
    assertThat(converted).isEqualTo(123);

    converted = convert("null", sc);
    assertThat(converted).isEqualTo(null);
  }

  @Test
  void unionField() {
    var schema = createSchema(
        """
             {
               "type": "record",
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

    var converted = convert(jsonPayload, schema);
    assertThat(converted).isInstanceOf(GenericData.Record.class);

    var record = (GenericData.Record) converted;
    assertThat(record.get("f_union")).isNull();


    jsonPayload = "{ \"f_union\": { \"int\": 123 } }";
    record = (GenericData.Record) convert(jsonPayload, schema);
    assertThat(record.get("f_union")).isEqualTo(123);

    jsonPayload = "{ \"f_union\": { \"TestAvroRecord\": { \"f_union\": { \"int\": 123  } } } }";
    record = (GenericData.Record) convert(jsonPayload, schema);

    assertThat(record.get("f_union")).isInstanceOf(GenericData.Record.class);
    var innerRec = (GenericData.Record) record.get("f_union");
    assertThat(innerRec.get("f_union")).isEqualTo(123);
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

    var converted = convert(jsonPayload, schema);
    assertThat(converted).isInstanceOf(GenericData.Record.class);

    var record = (GenericData.Record) converted;
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

    var converted = convert(jsonPayload, schema);
    assertThat(converted).isInstanceOf(GenericData.Record.class);

    var record = (GenericData.Record) converted;
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

    var converted = convert(jsonPayload, schema);
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

  private Schema createSchema(String schema) {
    return new AvroSchema(schema).rawSchema();
  }

}
