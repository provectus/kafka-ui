package com.provectus.kafka.ui.serde.schemaregistry;

import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import java.io.IOException;
import org.apache.avro.Schema;
import org.apache.avro.util.Utf8;
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
    return new KafkaAvroSerializer(client);
  }

  @Override
  protected Object read(byte[] value, ParsedSchema schema) {
    Schema rawSchema = ((AvroSchema) schema).rawSchema();

    try {
      Object object = AvroSchemaUtils.toObject(new String(value), (AvroSchema) schema);
      if (rawSchema.getType().equals(Schema.Type.STRING)) {
        object = ((Utf8) object).toString();
      }
      return object;
    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }

  }
}
