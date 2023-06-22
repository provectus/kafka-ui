package com.provectus.kafka.ui.serdes.builtin.sr;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import net.bytebuddy.utility.RandomString;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.io.Encoder;
import org.apache.avro.io.EncoderFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class SchemaRegistrySerdeTest {

  private final MockSchemaRegistryClient registryClient = new MockSchemaRegistryClient();

  private SchemaRegistrySerde serde;

  @BeforeEach
  void init() {
    serde = new SchemaRegistrySerde();
    serde.configure(List.of("wontbeused"), registryClient, "%s-key", "%s-value", true);
  }

  @ParameterizedTest
  @CsvSource({
      "test_topic, test_topic-key, KEY",
      "test_topic, test_topic-value, VALUE"
  })
  @SneakyThrows
  void returnsSchemaDescriptionIfSchemaRegisteredInSR(String topic, String subject, Serde.Target target) {
    int schemaId = registryClient.register(subject, new AvroSchema("{ \"type\": \"int\" }"));
    int registeredVersion = registryClient.getLatestSchemaMetadata(subject).getVersion();

    var schemaOptional = serde.getSchema(topic, target);
    assertThat(schemaOptional).isPresent();

    SchemaDescription schemaDescription = schemaOptional.get();
    assertThat(schemaDescription.getSchema())
        .contains(
            "{\"$id\":\"int\",\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"type\":\"integer\"}");
    assertThat(schemaDescription.getAdditionalProperties())
        .containsOnlyKeys("subject", "schemaId", "latestVersion", "type")
        .containsEntry("subject", subject)
        .containsEntry("schemaId", schemaId)
        .containsEntry("latestVersion", registeredVersion)
        .containsEntry("type", "AVRO");
  }

  @Test
  void returnsEmptyDescriptorIfSchemaNotRegisteredInSR() {
    String topic = "test";
    assertThat(serde.getSchema(topic, Serde.Target.KEY)).isEmpty();
    assertThat(serde.getSchema(topic, Serde.Target.VALUE)).isEmpty();
  }

  @Test
  void serializeTreatsInputAsJsonAvroSchemaPayload() throws RestClientException, IOException {
    AvroSchema schema = new AvroSchema(
        "{"
            + "  \"type\": \"record\","
            + "  \"name\": \"TestAvroRecord1\","
            + "  \"fields\": ["
            + "    {"
            + "      \"name\": \"field1\","
            + "      \"type\": \"string\""
            + "    },"
            + "    {"
            + "      \"name\": \"field2\","
            + "      \"type\": \"int\""
            + "    }"
            + "  ]"
            + "}"
    );
    String jsonValue = "{ \"field1\":\"testStr\", \"field2\": 123 }";
    String topic = "test";

    int schemaId = registryClient.register(topic + "-value", schema);
    byte[] serialized = serde.serializer(topic, Serde.Target.VALUE).serialize(jsonValue);
    byte[] expected = toBytesWithMagicByteAndSchemaId(schemaId, jsonValue, schema);
    assertThat(serialized).isEqualTo(expected);
  }

  @Test
  void deserializeReturnsJsonAvroMsgJsonRepresentation() throws RestClientException, IOException {
    AvroSchema schema = new AvroSchema(
        "{"
            + "  \"type\": \"record\","
            + "  \"name\": \"TestAvroRecord1\","
            + "  \"fields\": ["
            + "    {"
            + "      \"name\": \"field1\","
            + "      \"type\": \"string\""
            + "    },"
            + "    {"
            + "      \"name\": \"field2\","
            + "      \"type\": \"int\""
            + "    }"
            + "  ]"
            + "}"
    );
    String jsonValue = "{ \"field1\":\"testStr\", \"field2\": 123 }";

    String topic = "test";
    int schemaId = registryClient.register(topic + "-value", schema);

    byte[] data = toBytesWithMagicByteAndSchemaId(schemaId, jsonValue, schema);
    var result = serde.deserializer(topic, Serde.Target.VALUE).deserialize(null, data);

    assertJsonsEqual(jsonValue, result.getResult());
    assertThat(result.getType()).isEqualTo(DeserializeResult.Type.JSON);
    assertThat(result.getAdditionalProperties())
        .contains(Map.entry("type", "AVRO"))
        .contains(Map.entry("schemaId", schemaId));
  }

  @Nested
  class SerdeWithDisabledSubjectExistenceCheck {

    @BeforeEach
    void init() {
      serde.configure(List.of("wontbeused"), registryClient, "%s-key", "%s-value", false);
    }

    @Test
    void canDeserializeAlwaysReturnsTrue() {
      String topic = RandomString.make(10);
      assertThat(serde.canDeserialize(topic, Serde.Target.KEY)).isTrue();
      assertThat(serde.canDeserialize(topic, Serde.Target.VALUE)).isTrue();
    }
  }

  @Nested
  class SerdeWithEnabledSubjectExistenceCheck {

    @BeforeEach
    void init() {
      serde.configure(List.of("wontbeused"), registryClient, "%s-key", "%s-value", true);
    }

    @Test
    void canDeserializeReturnsTrueIfSubjectExists() throws Exception {
      String topic = RandomString.make(10);
      registryClient.register(topic + "-key", new AvroSchema("\"int\""));
      registryClient.register(topic + "-value", new AvroSchema("\"int\""));

      assertThat(serde.canDeserialize(topic, Serde.Target.KEY)).isTrue();
      assertThat(serde.canDeserialize(topic, Serde.Target.VALUE)).isTrue();
    }

    @Test
    void canDeserializeReturnsFalseIfSubjectDoesNotExist() {
      String topic = RandomString.make(10);
      assertThat(serde.canDeserialize(topic, Serde.Target.KEY)).isFalse();
      assertThat(serde.canDeserialize(topic, Serde.Target.VALUE)).isFalse();
    }
  }

  @Test
  void canDeserializeAndCanSerializeReturnsTrueIfSubjectExists() throws Exception {
    String topic = RandomString.make(10);
    registryClient.register(topic + "-key", new AvroSchema("\"int\""));
    registryClient.register(topic + "-value", new AvroSchema("\"int\""));

    assertThat(serde.canSerialize(topic, Serde.Target.KEY)).isTrue();
    assertThat(serde.canSerialize(topic, Serde.Target.VALUE)).isTrue();
  }

  @Test
  void canSerializeReturnsFalseIfSubjectDoesNotExist() {
    String topic = RandomString.make(10);
    assertThat(serde.canSerialize(topic, Serde.Target.KEY)).isFalse();
    assertThat(serde.canSerialize(topic, Serde.Target.VALUE)).isFalse();
  }

  @SneakyThrows
  private void assertJsonsEqual(String expected, String actual) {
    var mapper = new JsonMapper();
    assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
  }

  private byte[] toBytesWithMagicByteAndSchemaId(int schemaId, String json, AvroSchema schema) {
    return toBytesWithMagicByteAndSchemaId(schemaId, jsonToAvro(json, schema));
  }

  private byte[] toBytesWithMagicByteAndSchemaId(int schemaId, byte[] body) {
    return ByteBuffer.allocate(1 + 4 + body.length)
        .put((byte) 0)
        .putInt(schemaId)
        .put(body)
        .array();
  }

  @SneakyThrows
  private byte[] jsonToAvro(String json, AvroSchema schema) {
    GenericDatumWriter<Object> writer = new GenericDatumWriter<>(schema.rawSchema());
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    Encoder encoder = EncoderFactory.get().binaryEncoder(output, null);
    writer.write(JsonAvroConversion.convertJsonToAvro(json, schema.rawSchema()), encoder);
    encoder.flush();
    return output.toByteArray();
  }

  @Test
  void avroFieldsRepresentationIsConsistentForSerializationAndDeserialization() throws Exception {
    AvroSchema schema = new AvroSchema(
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
                  "name": "f_map",
                  "type": {
                     "type": "map",
                     "values" : "string",
                     "default": {}
                   }
                 },
                 {
                  "name": "f_union",
                  "type": ["null", "string", "int" ]
                 },
                 {
                  "name": "f_optional_to_test_not_filled_case",
                  "type": [ "null", "string"]
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
          "f_map": { "k1": "string value" },
          "f_union": { "int": 123 },
          "f_fixed": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004Ò",
          "f_bytes": "\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\t)"
        }
        """;

    registryClient.register("test-value", schema);
    assertSerdeCycle("test", jsonPayload);
  }

  @Test
  void avroLogicalTypesRepresentationIsConsistentForSerializationAndDeserialization() throws Exception {
    AvroSchema schema = new AvroSchema(
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
          "lt_timestamp_micros": "2007-12-03T10:15:30.123456Z",
          "lt_local_timestamp_millis": "2017-12-03T10:15:30.123",
          "lt_local_timestamp_micros": "2017-12-03T10:15:30.123456"
        }
        """;

    registryClient.register("test-value", schema);
    assertSerdeCycle("test", jsonPayload);
  }

  // 1. serialize input json to binary
  // 2. deserialize from binary
  // 3. check that deserialized version equal to input
  void assertSerdeCycle(String topic, String jsonInput) {
    byte[] serializedBytes = serde.serializer(topic, Serde.Target.VALUE).serialize(jsonInput);
    var deserializedJson = serde.deserializer(topic, Serde.Target.VALUE)
        .deserialize(null, serializedBytes)
        .getResult();
    assertJsonsEqual(jsonInput, deserializedJson);
  }

}
