package com.provectus.kafka.ui.serdes.builtin.sr;

import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import lombok.SneakyThrows;

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
