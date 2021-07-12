package com.provectus.kafka.ui.serde.schemaregistry;

import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import java.io.IOException;
import java.util.Map;
import org.apache.kafka.common.serialization.Serializer;

public class AvroMessageReader extends MessageReader<Object> {

  public AvroMessageReader(String topic, boolean isKey,
                           SchemaRegistryClient client,
                           SchemaMetadata schema)
      throws IOException, RestClientException {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<Object> createSerializer(SchemaRegistryClient client) {
    var serializer = new KafkaAvroSerializer(client);
    // need to call configure to set isKey property
    serializer.configure(Map.of("schema.registry.url", "wontbeused"), isKey);
    return serializer;
  }

  @Override
  protected Object read(String value, ParsedSchema schema) {
    try {
      return AvroSchemaUtils.toObject(value, (AvroSchema) schema);
    } catch (Throwable e) {
      throw new RuntimeException("Failed to serialize record for topic " + topic, e);
    }

  }
}
