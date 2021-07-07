package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.exception.ValidationException;
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
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

//TODO: currently we assume that keys for this serde are always string - need to discuss if it is ok
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
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      return new DeserializedKeyValue(
          msg.key() != null ? new String(msg.key().get()) : null,
          msg.value() != null ? parse(msg.value().get()) : null
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  @SneakyThrows
  private Object parse(byte[] value) {
    DynamicMessage protoMsg = DynamicMessage.parseFrom(
        protobufSchema.toDescriptor(),
        new ByteArrayInputStream(value)
    );
    byte[] jsonFromProto = ProtobufSchemaUtils.toJson(protoMsg);
    return parseJson(jsonFromProto);
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable ParsedInputObject key,
                                                  @Nullable ParsedInputObject data,
                                                  @Nullable Integer partition) {
    if (data == null) {
      return new ProducerRecord<>(topic, partition, toStringBytes(key), null);
    }
    if (!data.isJsonObject()) {
      throw new ValidationException("message content should be an object");
    }
    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
    try {
      JsonFormat.parser().merge(data.jsonForSerializing(), builder);
      final DynamicMessage message = builder.build();
      return new ProducerRecord<>(
          topic,
          partition,
          toStringBytes(key),
          message.toByteArray()
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }
  }

  private byte[] toStringBytes(ParsedInputObject obj) {
    return Optional.ofNullable(obj).map(o -> o.jsonForSerializing().getBytes()).orElse(null);
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
