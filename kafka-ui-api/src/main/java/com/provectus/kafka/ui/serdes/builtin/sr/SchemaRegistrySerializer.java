package com.provectus.kafka.ui.serdes.builtin.sr;

import com.provectus.kafka.ui.serde.api.Serde;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import lombok.SneakyThrows;
import org.apache.kafka.common.serialization.Serializer;

abstract class SchemaRegistrySerializer<T> implements Serde.Serializer {
  protected final Serializer<T> serializer;
  protected final String topic;
  protected final boolean isKey;
  protected final ParsedSchema schema;

  @SneakyThrows
  protected SchemaRegistrySerializer(String topic, boolean isKey, SchemaRegistryClient client,
                                     SchemaMetadata schema) {
    this.topic = topic;
    this.isKey = isKey;
    this.serializer = createSerializer(client);
    this.schema = client.getSchemaById(schema.getId());
  }

  protected abstract Serializer<T> createSerializer(SchemaRegistryClient client);

  @Override
  public byte[] serialize(String input) {
    final T read = this.serialize(input, schema);
    return this.serializer.serialize(topic, read);
  }

  protected abstract T serialize(String value, ParsedSchema schema);
}
