package com.provectus.kafka.ui.serdes.builtin.sr;

import com.provectus.kafka.ui.util.jsonschema.JsonAvroConversion;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import io.confluent.kafka.serializers.KafkaAvroSerializerConfig;
import java.util.Map;
import org.apache.kafka.common.serialization.Serializer;

class AvroSchemaRegistrySerializer extends SchemaRegistrySerializer<Object> {

  AvroSchemaRegistrySerializer(String topic, boolean isKey,
                               SchemaRegistryClient client,
                               SchemaMetadata schema) {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<Object> createSerializer(SchemaRegistryClient client) {
    var serializer = new KafkaAvroSerializer(client);
    serializer.configure(
        Map.of(
            "schema.registry.url", "wontbeused",
            AbstractKafkaSchemaSerDeConfig.AUTO_REGISTER_SCHEMAS, false,
            KafkaAvroSerializerConfig.AVRO_USE_LOGICAL_TYPE_CONVERTERS_CONFIG, true,
            AbstractKafkaSchemaSerDeConfig.USE_LATEST_VERSION, true
        ),
        isKey
    );
    return serializer;
  }

  @Override
  protected Object serialize(String value, ParsedSchema schema) {
    try {
      return JsonAvroConversion.convertJsonToAvro(value, ((AvroSchema) schema).rawSchema());
    } catch (Throwable e) {
      throw new RuntimeException("Failed to serialize record for topic " + topic, e);
    }

  }
}
