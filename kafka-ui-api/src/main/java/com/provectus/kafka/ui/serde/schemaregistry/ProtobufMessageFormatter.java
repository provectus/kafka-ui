package com.provectus.kafka.ui.serde.schemaregistry;

import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import lombok.SneakyThrows;

public class ProtobufMessageFormatter implements MessageFormatter {
  private final KafkaProtobufDeserializer<?> protobufDeserializer;

  public ProtobufMessageFormatter(SchemaRegistryClient client) {
    this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
  }

  @Override
  @SneakyThrows
  public String format(String topic, byte[] value) {
    final Message message = protobufDeserializer.deserialize(topic, value);
    byte[] jsonBytes = ProtobufSchemaUtils.toJson(message);
    return new String(jsonBytes);
  }
}
