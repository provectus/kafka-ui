package com.provectus.kafka.ui.serde.schemaregistry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.io.Encoder;
import org.apache.avro.io.EncoderFactory;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class SchemaRegistryAwareRecordSerDeTest {

  private final SchemaRegistryClient registryClient = mock(SchemaRegistryClient.class);

  private final SchemaRegistryAwareRecordSerDe serde = new SchemaRegistryAwareRecordSerDe(
      KafkaCluster.builder().build(),
      registryClient
  );

  @Nested
  class Deserialize {

    @Test
    void callsSchemaFormatterWhenValueHasMagicByteAndValidSchemaId() throws Exception {
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

      String jsonValueForSchema = "{ \"field1\":\"testStr\", \"field2\": 123 }";

      int schemaId = 1234;
      when(registryClient.getSchemaById(schemaId)).thenReturn(schema);

      var result = serde.deserialize(
          new ConsumerRecord<>(
              "test-topic",
              1,
              100,
              Bytes.wrap("key".getBytes()),
              bytesWithMagicByteAndSchemaId(schemaId, jsonToAvro(jsonValueForSchema, schema))
          )
      );

      // called twice: once by serde code, once by formatter (will be cached)
      verify(registryClient, times(2)).getSchemaById(schemaId);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueSchemaId()).isEqualTo(schemaId + "");
      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.AVRO);
      assertJsonsEqual(jsonValueForSchema, result.getValue());
    }

    @Test
    void fallsBackToStringFormatterIfValueContainsMagicByteButSchemaNotFound() throws Exception {
      int nonExistingSchemaId = 12341234;
      when(registryClient.getSchemaById(nonExistingSchemaId))
          .thenThrow(new RestClientException("not fount", 404, 404));

      Bytes value = bytesWithMagicByteAndSchemaId(nonExistingSchemaId, "somedata".getBytes());
      var result = serde.deserialize(
          new ConsumerRecord<>(
              "test-topic",
              1,
              100,
              Bytes.wrap("key".getBytes()),
              value
          )
      );

      // called to get schema by id - will throw not found
      verify(registryClient, times(1)).getSchemaById(nonExistingSchemaId);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueSchemaId()).isNull();
      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getValue()).isEqualTo(new String(value.get()));
    }

    @Test
    void fallsBackToStringFormatterIfMagicByteAndSchemaIdFoundButFormatterFailed() throws Exception {
      int schemaId = 1234;
      when(registryClient.getSchemaById(schemaId))
          .thenReturn(new AvroSchema("{ \"type\": \"string\" }"));

      // will cause exception in avro deserializer
      Bytes nonAvroValue =  bytesWithMagicByteAndSchemaId(schemaId, "123".getBytes());
      var result = serde.deserialize(
          new ConsumerRecord<>(
              "test-topic",
              1,
              100,
              Bytes.wrap("key".getBytes()),
             nonAvroValue
          )
      );

      // called twice: once by serde code, once by formatter (will be cached)
      verify(registryClient, times(2)).getSchemaById(schemaId);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueSchemaId()).isNull();
      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getValue()).isEqualTo(new String(nonAvroValue.get()));
    }

    @Test
    void useStringFormatterWithoutRegistryManipulationIfMagicByteNotSet() {
      var result = serde.deserialize(
          new ConsumerRecord<>(
              "test-topic",
              1,
              100,
              Bytes.wrap("key".getBytes()),
              Bytes.wrap("val".getBytes())
          )
      );

      verifyZeroInteractions(registryClient);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueSchemaId()).isNull();
      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getValue()).isEqualTo("val");
    }

    private void assertJsonsEqual(String expected, String actual) throws JsonProcessingException {
      var mapper = new JsonMapper();
      assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
    }

    private Bytes bytesWithMagicByteAndSchemaId(int schemaId, byte[] body) {
      return new Bytes(
          ByteBuffer.allocate(1 + 4 + body.length)
              .put((byte) 0)
              .putInt(schemaId)
              .put(body)
              .array()
      );
    }

    private byte[] jsonToAvro(String json, AvroSchema schema) throws IOException {
      GenericDatumWriter<Object> writer = new GenericDatumWriter<>(schema.rawSchema());
      ByteArrayOutputStream output = new ByteArrayOutputStream();
      Encoder encoder = EncoderFactory.get().binaryEncoder(output, null);
      writer.write(AvroSchemaUtils.toObject(json, schema), encoder);
      encoder.flush();
      return output.toByteArray();
    }
  }


}