package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.entities.Schema;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import lombok.SneakyThrows;
import org.apache.kafka.common.serialization.Serializer;

public class JsonMessageReader extends MessageReader<JsonNode> {
  private static final ObjectMapper mapper = new ObjectMapper();

  public JsonMessageReader(String topic, boolean isKey,
                           SchemaRegistryClient client, SchemaMetadata schema) throws IOException,
      RestClientException {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<JsonNode> createSerializer(SchemaRegistryClient client) {
    return new JsonNodeSerializer();
  }

  @Override
  @SneakyThrows
  protected JsonNode read(byte[] value, ParsedSchema schema) {
    return mapper.readTree(new String(value));
  }

  private static class JsonNodeSerializer implements Serializer<JsonNode> {
    @Override
    public byte[] serialize(String topic, JsonNode data) {
      return data.toString().getBytes();
    }
  }
}
