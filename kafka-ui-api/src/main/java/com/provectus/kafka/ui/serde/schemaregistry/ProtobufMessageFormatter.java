package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;

import java.io.IOException;
import java.util.Map;
import lombok.SneakyThrows;

public class ProtobufMessageFormatter implements MessageFormatter {
  private final KafkaProtobufDeserializer<?> protobufDeserializer;
  private final ObjectMapper objectMapper;

  public ProtobufMessageFormatter(SchemaRegistryClient client, ObjectMapper objectMapper) {
    this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
    this.objectMapper = objectMapper;
  }

  @Override
  @SneakyThrows
  public Object format(String topic, byte[] value) {
    final Message message = protobufDeserializer.deserialize(topic, value);
    return parseJson(ProtobufSchemaUtils.toJson(message));
  }

  private Object parseJson(byte[] bytes) throws IOException {
    return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
    });
  }
}
