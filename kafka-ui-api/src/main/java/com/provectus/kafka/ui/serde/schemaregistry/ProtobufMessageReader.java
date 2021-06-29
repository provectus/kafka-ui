package com.provectus.kafka.ui.serde.schemaregistry;

import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
import java.io.IOException;
import org.apache.kafka.common.serialization.Serializer;

public class ProtobufMessageReader extends MessageReader<Message> {

  public ProtobufMessageReader(String topic, boolean isKey,
                               SchemaRegistryClient client, SchemaMetadata schema)
      throws IOException, RestClientException {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<Message> createSerializer(SchemaRegistryClient client) {
    return new KafkaProtobufSerializer<>(client);
  }

  @Override
  protected Message read(byte[] value, ParsedSchema schema) {
    ProtobufSchema protobufSchema = (ProtobufSchema) schema;
    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
    try {
      JsonFormat.parser().merge(new String(value), builder);
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }
  }

}
