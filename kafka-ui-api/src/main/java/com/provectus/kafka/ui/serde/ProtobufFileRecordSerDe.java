package com.provectus.kafka.ui.serde;

import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class ProtobufFileRecordSerDe implements RecordSerDe {
  private final ProtobufSchema protobufSchema;
  private final Path protobufSchemaPath;
  private final ProtobufSchemaConverter schemaConverter = new ProtobufSchemaConverter();
  private final Map<String, Descriptor> messageDescriptorMap;
  private final Map<String, Descriptor> keyMessageDescriptorMap;
  private final Descriptor defaultMessageDescriptor;
  private final Descriptor defaultKeyMessageDescriptor;

  public ProtobufFileRecordSerDe(Path protobufSchemaPath, Map<String, String> messageNameMap,
                                 Map<String, String> keyMessageNameMap, String defaultMessageName,
                                 String defaultKeyMessageName)
      throws IOException {
    this.protobufSchemaPath = protobufSchemaPath;
    try (final Stream<String> lines = Files.lines(protobufSchemaPath)) {
      var schema = new ProtobufSchema(
          lines.collect(Collectors.joining("\n"))
      );
      if (defaultMessageName != null) {
        this.protobufSchema = schema.copy(defaultMessageName);
      } else {
        this.protobufSchema = schema;
      }
      this.messageDescriptorMap = new HashMap<>();
      if (messageNameMap != null) {
        populateDescriptors(messageNameMap, messageDescriptorMap);
      }
      this.keyMessageDescriptorMap = new HashMap<>();
      if (keyMessageNameMap != null) {
        populateDescriptors(keyMessageNameMap, keyMessageDescriptorMap);
      }
      defaultMessageDescriptor = Objects.requireNonNull(protobufSchema.toDescriptor(),
          "The given message type is not found in protobuf definition: "
              + defaultMessageName);
      if (defaultKeyMessageName != null) {
        defaultKeyMessageDescriptor = schema.copy(defaultKeyMessageName).toDescriptor();
      } else {
        defaultKeyMessageDescriptor = null;
      }
    }
  }

  private void populateDescriptors(Map<String, String> messageNameMap, Map<String, Descriptor> messageDescriptorMap) {
    for (Map.Entry<String, String> entry : messageNameMap.entrySet()) {
      var descriptor = Objects.requireNonNull(protobufSchema.toDescriptor(entry.getValue()),
          "The given message type is not found in protobuf definition: "
              + entry.getValue());
      messageDescriptorMap.put(entry.getKey(), descriptor);
    }
  }

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      var builder = DeserializedKeyValue.builder();
      if (msg.key() != null) {
        Descriptor descriptor = getKeyDescriptor(msg.topic());
        if (descriptor == null) {
          builder.key(new String(msg.key().get()));
          builder.keyFormat(MessageFormat.UNKNOWN);
        } else {
          builder.key(parse(msg.key().get(), descriptor));
          builder.keyFormat(MessageFormat.PROTOBUF);
        }
      }
      if (msg.value() != null) {
        builder.value(parse(msg.value().get(), getDescriptor(msg.topic())));
        builder.valueFormat(MessageFormat.PROTOBUF);
      }
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  private Descriptor getKeyDescriptor(String topic) {
    return keyMessageDescriptorMap.getOrDefault(topic, defaultKeyMessageDescriptor);
  }

  private Descriptor getDescriptor(String topic) {
    return messageDescriptorMap.getOrDefault(topic, defaultMessageDescriptor);
  }

  @SneakyThrows
  private String parse(byte[] value, Descriptor descriptor) {
    DynamicMessage protoMsg = DynamicMessage.parseFrom(
        descriptor,
        new ByteArrayInputStream(value)
    );
    byte[] jsonFromProto = ProtobufSchemaUtils.toJson(protoMsg);
    return new String(jsonFromProto);
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable String key,
                                                  @Nullable String data,
                                                  @Nullable Integer partition) {
    if (data == null) {
      return new ProducerRecord<>(topic, partition, Objects.requireNonNull(key).getBytes(), null);
    }
    DynamicMessage.Builder builder = DynamicMessage.newBuilder(getDescriptor(topic));
    try {
      JsonFormat.parser().merge(data, builder);
      final DynamicMessage message = builder.build();
      return new ProducerRecord<>(
          topic,
          partition,
          Optional.ofNullable(key).map(String::getBytes).orElse(null),
          message.toByteArray()
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to merge record for topic " + topic, e);
    }
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {

    final JsonSchema jsonSchema = schemaConverter.convert(
        protobufSchemaPath.toUri(),
        getDescriptor(topic)
    );
    final MessageSchemaDTO keySchema = new MessageSchemaDTO()
        .name(protobufSchema.fullName())
        .source(MessageSchemaDTO.SourceEnum.PROTO_FILE)
        .schema(JsonSchema.stringSchema().toJson());

    final MessageSchemaDTO valueSchema = new MessageSchemaDTO()
        .name(protobufSchema.fullName())
        .source(MessageSchemaDTO.SourceEnum.PROTO_FILE)
        .schema(jsonSchema.toJson());

    return new TopicMessageSchemaDTO()
        .key(keySchema)
        .value(valueSchema);
  }
}
