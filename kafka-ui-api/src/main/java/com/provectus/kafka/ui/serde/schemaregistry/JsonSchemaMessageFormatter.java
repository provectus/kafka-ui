package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.json.KafkaJsonSchemaDeserializer;
import lombok.SneakyThrows;

public class JsonSchemaMessageFormatter implements MessageFormatter {

  private static final ObjectMapper JSON_MAPPER = new ObjectMapper();

  private final KafkaJsonSchemaDeserializer<JsonNode> jsonSchemaDeserializer;

  public JsonSchemaMessageFormatter(SchemaRegistryClient client) {
    this.jsonSchemaDeserializer = new KafkaJsonSchemaDeserializer<>(client);
  }

  @SneakyThrows
  @Override
  public String format(String topic, byte[] value) {
    JsonNode json = jsonSchemaDeserializer.deserialize(topic, value);
    return json.toString();
  }
}
