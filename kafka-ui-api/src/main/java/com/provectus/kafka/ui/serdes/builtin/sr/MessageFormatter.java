package com.provectus.kafka.ui.serdes.builtin.sr;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import java.util.Map;
import lombok.SneakyThrows;

interface MessageFormatter {

  String format(String topic, byte[] value);

  static Map<SchemaType, MessageFormatter> createMap(SchemaRegistryClient schemaRegistryClient) {
    return Map.of(
        SchemaType.AVRO, new AvroMessageFormatter(schemaRegistryClient),
        SchemaType.JSON, new JsonSchemaMessageFormatter(schemaRegistryClient),
        SchemaType.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryClient)
    );
  }

  class AvroMessageFormatter implements MessageFormatter {
    private final KafkaAvroDeserializer avroDeserializer;

    AvroMessageFormatter(SchemaRegistryClient client) {
      this.avroDeserializer = new KafkaAvroDeserializer(client);
    }

    @Override
    @SneakyThrows
    public String format(String topic, byte[] value) {
      // deserialized will have type, that depends on schema type (record or primitive),
      // AvroSchemaUtils.toJson(...) method will take it into account
      Object deserialized = avroDeserializer.deserialize(topic, value);
      byte[] jsonBytes = AvroSchemaUtils.toJson(deserialized);
      return new String(jsonBytes);
    }
  }

  class ProtobufMessageFormatter implements MessageFormatter {
    private final KafkaProtobufDeserializer<?> protobufDeserializer;

    ProtobufMessageFormatter(SchemaRegistryClient client) {
      this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
    }

    @Override
    @SneakyThrows
    public String format(String topic, byte[] value) {
      final Message message = protobufDeserializer.deserialize(topic, value);
      return JsonFormat.printer()
          .includingDefaultValueFields()
          .omittingInsignificantWhitespace()
          .preservingProtoFieldNames()
          .print(message);
    }
  }

  class JsonSchemaMessageFormatter implements MessageFormatter {
    private final KafkaJsonSchemaDeserializer<JsonNode> jsonSchemaDeserializer;

    JsonSchemaMessageFormatter(SchemaRegistryClient client) {
      this.jsonSchemaDeserializer = new KafkaJsonSchemaDeserializer<>(client);
    }

    @Override
    public String format(String topic, byte[] value) {
      JsonNode json = jsonSchemaDeserializer.deserialize(topic, value);
      return json.toString();
    }
  }
}
