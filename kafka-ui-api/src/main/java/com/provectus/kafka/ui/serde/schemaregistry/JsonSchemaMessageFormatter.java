package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;

public class JsonSchemaMessageFormatter implements MessageFormatter {

  private final KafkaJsonSchemaDeserializer<JsonNode> jsonSchemaDeserializer;

  public JsonSchemaMessageFormatter(SchemaRegistryClient client) {
    this.jsonSchemaDeserializer = new KafkaJsonSchemaDeserializer<>(client);
  }

  @Override
  public JsonNode format(String topic, byte[] value) {
    return jsonSchemaDeserializer.deserialize(topic, value);
  }

  @Override
  public MessageFormat getFormat() {
    return MessageFormat.JSON;
  }
}
