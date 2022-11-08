package com.provectus.kafka.ui.serde.schemaregistry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.client.BufSchemaRegistryClient;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ProtoSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
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

class BufAndSchemaRegistryAwareRecordSerDeTest {

  private final SchemaRegistryClient registryClient = mock(SchemaRegistryClient.class);
  private final BufSchemaRegistryClient bufClient = mock(BufSchemaRegistryClient.class);

  private final BufAndSchemaRegistryAwareRecordSerDe serde = new BufAndSchemaRegistryAwareRecordSerDe(
      KafkaCluster.builder().build(),
      registryClient,
      bufClient);

  @Nested
  class Deserialize {

    // copied from SchemaRegistryAwareRecordSerDe
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
              + "}");

      String jsonValueForSchema = "{ \"field1\":\"testStr\", \"field2\": 123 }";

      int schemaId = 1234;
      when(registryClient.getSchemaById(schemaId)).thenReturn(schema);
      when(registryClient.getSchemaBySubjectAndId(null, schemaId)).thenReturn(schema);

      var result = serde.deserialize(
          new ConsumerRecord<>(
              "test-topic",
              1,    
              100,
              Bytes.wrap("key".getBytes()),
              bytesWithMagicByteAndSchemaId(schemaId, jsonToAvro(jsonValueForSchema, schema))));

      // called once by serde code
      verify(registryClient, times(1)).getSchemaById(schemaId);
      //called once by formatter (will be cached)
      verify(registryClient, times(1)).getSchemaBySubjectAndId(null, schemaId);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueSchemaId()).isEqualTo(schemaId + "");
      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.AVRO);
      assertJsonsEqual(jsonValueForSchema, result.getValue());
    }

    @Test
    void callsBufFormatterWhenValueHasCorrectHeader() throws Exception {
      ConsumerRecord<Bytes, Bytes> record = new ConsumerRecord<>(
          "test-topic",
          1,
          100,
          Bytes.wrap("key".getBytes()),
          Bytes.wrap("value".getBytes()));
      record.headers().add("PROTOBUF_TYPE", "protobuf_type".getBytes());
      var result = serde.deserialize(record);

      // verify schema registry was skipped
      verify(registryClient, times(0)).getSchemaById(0);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.UNKNOWN);
    }

    @Test
    void callsBufFormatterWhenTopicIsCorrect() throws Exception {
      ConsumerRecord<Bytes, Bytes> record = new ConsumerRecord<>(
          "test-topic.proto.foo",
          1,
          100,
          Bytes.wrap("key".getBytes()),
          Bytes.wrap("value".getBytes()));
      var result = serde.deserialize(record);

      // verify schema registry was skipped
      verify(registryClient, times(0)).getSchemaById(0);

      assertThat(result.getKeySchemaId()).isNull();
      assertThat(result.getKeyFormat()).isEqualTo(MessageFormat.UNKNOWN);
      assertThat(result.getKey()).isEqualTo("key");

      assertThat(result.getValueFormat()).isEqualTo(MessageFormat.UNKNOWN);
    }

    @Test
    void testProtoSchemaCorrectFromHeaders() throws Exception {
      ConsumerRecord<Bytes, Bytes> record = new ConsumerRecord<>(
          "test-topic",
          1,
          100,
          Bytes.wrap("key".getBytes()),
          Bytes.wrap("value".getBytes()));
      record.headers().add("protobuf.type.key", "protobuf_type.foo.v1.bar".getBytes());
      record.headers().add("protobuf.type.value", "protobuf_type.dead.v1.beef".getBytes());
      ProtoSchema protoSchemaKey = serde.protoKeySchemaFromHeaders(record.headers()).get();
      ProtoSchema protoSchemaValue = serde.protoValueSchemaFromHeaders(record.headers()).get();
      assertThat(protoSchemaKey.getFullyQualifiedTypeName()).isEqualTo("protobuf_type.foo.v1.bar");
      assertThat(protoSchemaValue.getFullyQualifiedTypeName()).isEqualTo("protobuf_type.dead.v1.beef");
    }

    @Test
    void testProtoSchemaCorrectFromTopic() throws Exception {
      ProtoSchema protoSchema = serde.protoSchemaFromTopic("test-topic.proto.v1.foo.bar").get();
      assertThat(protoSchema.getFullyQualifiedTypeName()).isEqualTo("v1.foo.bar");
    }

    private void assertJsonsEqual(String expected, String actual) throws JsonProcessingException {
      var mapper = new JsonMapper();
      assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
    }

    private byte[] jsonToAvro(String json, AvroSchema schema) throws IOException {
      GenericDatumWriter<Object> writer = new GenericDatumWriter<>(schema.rawSchema());
      ByteArrayOutputStream output = new ByteArrayOutputStream();
      Encoder encoder = EncoderFactory.get().binaryEncoder(output, null);
      writer.write(AvroSchemaUtils.toObject(json, schema), encoder);
      encoder.flush();
      return output.toByteArray();
    }

    private Bytes bytesWithMagicByteAndSchemaId(int schemaId, byte[] body) {
      return new Bytes(
          ByteBuffer.allocate(1 + 4 + body.length)
              .put((byte) 0)
              .putInt(schemaId)
              .put(body)
              .array());
    }
  }

}
