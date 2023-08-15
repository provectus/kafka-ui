package com.provectus.kafka.ui.serdes.builtin.sr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.util.annotation.KafkaClientInternalsDependant;
import com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.json.jackson.Jackson;
import io.confluent.kafka.schemaregistry.protobuf.MessageIndexes;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.serializers.protobuf.AbstractKafkaProtobufSerializer;
import io.confluent.kafka.serializers.subject.DefaultReferenceSubjectNameStrategy;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.HashMap;
import lombok.SneakyThrows;
import org.apache.avro.Schema;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DatumWriter;
import org.apache.avro.io.EncoderFactory;

final class Serialize {

  private static final byte MAGIC = 0x0;
  private static final ObjectMapper JSON_SERIALIZE_MAPPER = Jackson.newObjectMapper(); //from confluent package

  private Serialize() {
  }

  @KafkaClientInternalsDependant("AbstractKafkaJsonSchemaSerializer::serializeImpl")
  @SneakyThrows
  static byte[] serializeJson(JsonSchema schema, int schemaId, String value) {
    JsonNode json;
    try {
      json = JSON_SERIALIZE_MAPPER.readTree(value);
    } catch (JsonProcessingException e) {
      throw new ValidationException(String.format("'%s' is not valid json", value));
    }
    try {
      schema.validate(json);
    } catch (org.everit.json.schema.ValidationException e) {
      throw new ValidationException(
          String.format("'%s' does not fit schema: %s", value, e.getAllMessages()));
    }
    try (var out = new ByteArrayOutputStream()) {
      out.write(MAGIC);
      out.write(schemaId(schemaId));
      out.write(JSON_SERIALIZE_MAPPER.writeValueAsBytes(json));
      return out.toByteArray();
    }
  }

  @KafkaClientInternalsDependant("AbstractKafkaProtobufSerializer::serializeImpl")
  @SneakyThrows
  static byte[] serializeProto(SchemaRegistryClient srClient,
                               String topic,
                               Serde.Target target,
                               ProtobufSchema schema,
                               int schemaId,
                               String input) {
    // flags are tuned like in ProtobufSerializer by default
    boolean normalizeSchema = false;
    boolean autoRegisterSchema = false;
    boolean useLatestVersion = true;
    boolean latestCompatStrict = true;
    boolean skipKnownTypes = true;

    schema = AbstractKafkaProtobufSerializer.resolveDependencies(
        srClient, normalizeSchema, autoRegisterSchema, useLatestVersion, latestCompatStrict,
        new HashMap<>(), skipKnownTypes, new DefaultReferenceSubjectNameStrategy(),
        topic, target == Serde.Target.KEY, schema
    );

    DynamicMessage.Builder builder = schema.newMessageBuilder();
    JsonFormat.parser().merge(input, builder);
    Message message = builder.build();
    MessageIndexes indexes = schema.toMessageIndexes(message.getDescriptorForType().getFullName(), normalizeSchema);
    try (var out = new ByteArrayOutputStream()) {
      out.write(MAGIC);
      out.write(schemaId(schemaId));
      out.write(indexes.toByteArray());
      message.writeTo(out);
      return out.toByteArray();
    }
  }

  @KafkaClientInternalsDependant("AbstractKafkaAvroSerializer::serializeImpl")
  @SneakyThrows
  static byte[] serializeAvro(AvroSchema schema, int schemaId, String input) {
    var avroObject = JsonAvroConversion.convertJsonToAvro(input, schema.rawSchema());
    try (var out = new ByteArrayOutputStream()) {
      out.write(MAGIC);
      out.write(schemaId(schemaId));
      Schema rawSchema = schema.rawSchema();
      if (rawSchema.getType().equals(Schema.Type.BYTES)) {
        Preconditions.checkState(
            avroObject instanceof ByteBuffer,
            "Unrecognized bytes object of type: " + avroObject.getClass().getName()
        );
        out.write(((ByteBuffer) avroObject).array());
      } else {
        boolean useLogicalTypeConverters = true;
        BinaryEncoder encoder = EncoderFactory.get().directBinaryEncoder(out, null);
        DatumWriter<Object> writer =
            (DatumWriter<Object>) AvroSchemaUtils.getDatumWriter(avroObject, rawSchema, useLogicalTypeConverters);
        writer.write(avroObject, encoder);
        encoder.flush();
      }
      return out.toByteArray();
    }
  }

  private static byte[] schemaId(int id) {
    return ByteBuffer.allocate(Integer.BYTES).putInt(id).array();
  }
}
