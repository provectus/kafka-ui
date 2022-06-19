package com.provectus.kafka.ui.serdes.builtin.sr;

import com.fasterxml.jackson.databind.JsonNode;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;

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
