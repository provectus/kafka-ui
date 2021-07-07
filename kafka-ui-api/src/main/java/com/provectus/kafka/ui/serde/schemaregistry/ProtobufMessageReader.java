package com.provectus.kafka.ui.serde.schemaregistry;

import com.google.common.base.Preconditions;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.ParsedInputObject;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
import java.io.IOException;
import java.util.Map;
import org.apache.kafka.common.serialization.Serializer;

public class ProtobufMessageReader extends MessageReader<Message> {

  public ProtobufMessageReader(String topic, boolean isKey,
                               SchemaRegistryClient client, SchemaMetadata schema)
      throws IOException, RestClientException {
    super(topic, isKey, client, schema);
  }

  @Override
  protected Serializer<Message> createSerializer(SchemaRegistryClient client) {
    var serializer = new KafkaProtobufSerializer<>(client);
    // need to call configure to set isKey property
    serializer.configure(Map.of("schema.registry.url", "wontbeused"), isKey);
    return serializer;
  }

  @Override
  protected Message read(ParsedInputObject value, ParsedSchema schema) {
    Preconditions.checkArgument(value.isJsonObject());
    ProtobufSchema protobufSchema = (ProtobufSchema) schema;
    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
    try {
      JsonFormat.parser().merge(value.jsonForSerializing(), builder);
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }
  }

}
