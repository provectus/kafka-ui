package com.provectus.kafka.ui.serde.schemaregistry;

import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.entities.Schema;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import org.apache.kafka.common.serialization.Serializer;

public abstract class MessageReader<T> {
  protected final Serializer<T> serializer;
  protected final String topic;
  protected final boolean isKey;

  private ParsedSchema schema;

  protected MessageReader(String topic, boolean isKey, SchemaRegistryClient client,
                          SchemaMetadata schema) throws IOException, RestClientException {
    this.topic = topic;
    this.isKey = isKey;
    this.serializer = createSerializer(client);
    this.schema = client.getSchemaById(schema.getId());
  }

  protected abstract Serializer<T> createSerializer(SchemaRegistryClient client);

  public byte[] read(byte[] value) {
    final T read = this.read(value, schema);
    return this.serializer.serialize(topic, read);
  }

  protected abstract T read(byte[] value, ParsedSchema schema);
}
