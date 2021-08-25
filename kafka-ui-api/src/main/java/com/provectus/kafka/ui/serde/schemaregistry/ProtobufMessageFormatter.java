package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import lombok.SneakyThrows;

public class ProtobufMessageFormatter implements MessageFormatter {
  private final KafkaProtobufDeserializer<?> protobufDeserializer;
  private static final ObjectMapper objectMapper = new ObjectMapper();

  public ProtobufMessageFormatter(SchemaRegistryClient client) {
    this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
  }

  @Override
  @SneakyThrows
  public JsonNode format(String topic, byte[] value) {
    final Message message = protobufDeserializer.deserialize(topic, value);
    byte[] jsonBytes = ProtobufSchemaUtils.toJson(message);
    return objectMapper.readTree(jsonBytes);
  }

  @Override
  public MessageFormat getFormat() {
    return MessageFormat.PROTOBUF;
  }
}
