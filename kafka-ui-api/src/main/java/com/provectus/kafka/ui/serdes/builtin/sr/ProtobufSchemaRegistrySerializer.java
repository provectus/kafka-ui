package com.provectus.kafka.ui.serdes.builtin.sr;

import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
import java.util.Map;
import lombok.SneakyThrows;
import org.apache.kafka.common.serialization.Serializer;

class ProtobufSchemaRegistrySerializer extends SchemaRegistrySerializer<Message> {

  @SneakyThrows
  public ProtobufSchemaRegistrySerializer(String topic, boolean isKey,
                                          SchemaRegistryClient client, SchemaMetadata schema) {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<Message> createSerializer(SchemaRegistryClient client) {
    var serializer = new KafkaProtobufSerializer<>(client);
    serializer.configure(
        Map.of(
            "schema.registry.url", "wontbeused",
            AbstractKafkaSchemaSerDeConfig.AUTO_REGISTER_SCHEMAS, false,
            AbstractKafkaSchemaSerDeConfig.USE_LATEST_VERSION, true
        ),
        isKey
    );
    return serializer;
  }

  @Override
  protected Message serialize(String value, ParsedSchema schema) {
    ProtobufSchema protobufSchema = (ProtobufSchema) schema;
    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
    try {
      JsonFormat.parser().merge(value, builder);
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to serialize record for topic " + topic, e);
    }
  }

}
