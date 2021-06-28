package com.provectus.kafka.ui.serde.schemaregistry;

import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import java.util.Map;
import lombok.SneakyThrows;

public class ProtobufMessageFormatter implements MessageFormatter {
  private final KafkaProtobufDeserializer<?> protobufDeserializer;

  public ProtobufMessageFormatter(SchemaRegistryClient client) {
    this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
  }

  @Override
  @SneakyThrows
  public Object format(String topic, byte[] value) {
    if (value != null) {
      final Message message = protobufDeserializer.deserialize(topic, value);
      return ProtobufSchemaUtils.toJson(message);
    } else {
      return Map.of();
    }
  }
}
