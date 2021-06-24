package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.model.MessageSchema;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class ProtobufFileRecordSerDe implements RecordSerDe {
  private final ProtobufSchema protobufSchema;
  private final ObjectMapper objectMapper;
  private final Path protobufSchemaPath;
  private final ProtobufSchemaConverter schemaConverter = new ProtobufSchemaConverter();

  public ProtobufFileRecordSerDe(Path protobufSchemaPath, String messageName,
                                 ObjectMapper objectMapper) throws IOException {
    this.objectMapper = objectMapper;
    this.protobufSchemaPath = protobufSchemaPath;
    try (final Stream<String> lines = Files.lines(protobufSchemaPath)) {
      this.protobufSchema = new ProtobufSchema(
          lines.collect(Collectors.joining())
      ).copy(messageName);
    }
  }

  @Override
  public Tuple2<String, Object> deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      final var message = DynamicMessage.parseFrom(
          protobufSchema.toDescriptor(),
          new ByteArrayInputStream(msg.value().get())
      );
      byte[] bytes = ProtobufSchemaUtils.toJson(message);
      return Tuples.of(
          msg.key() != null ? new String(msg.key().get()) : "",
          parseJson(bytes)
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic, byte[] key, byte[] data,
                                                  Optional<Integer> partition) {
    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
    try {
      JsonFormat.parser().merge(new String(data), builder);
      final DynamicMessage message = builder.build();
      return partition
          .map(p -> new ProducerRecord<>(topic, p, key, message.toByteArray()))
          .orElseGet(() -> new ProducerRecord<>(topic, key, message.toByteArray()));

    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }
  }

  @Override
  public TopicMessageSchema getTopicSchema(String topic) {

    final JsonSchema jsonSchema = schemaConverter.convert(
        protobufSchemaPath.toUri(),
        protobufSchema.toDescriptor()
    );
    final MessageSchema keySchema = new MessageSchema()
        .name(protobufSchema.fullName())
        .source(MessageSchema.SourceEnum.PROTO_FILE)
        .schema(JsonSchema.stringSchema().toJson(objectMapper));

    final MessageSchema valueSchema = new MessageSchema()
        .name(protobufSchema.fullName())
        .source(MessageSchema.SourceEnum.PROTO_FILE)
        .schema(jsonSchema.toJson(objectMapper));

    return new TopicMessageSchema()
        .key(keySchema)
        .value(valueSchema);
  }

  private Object parseJson(byte[] bytes) throws IOException {
    return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
    });
  }
}
