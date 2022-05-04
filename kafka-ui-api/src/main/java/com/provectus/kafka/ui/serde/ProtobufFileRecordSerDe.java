package com.provectus.kafka.ui.serde;

import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import com.provectus.kafka.ui.serde.schemaregistry.StringMessageFormatter;
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
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class ProtobufFileRecordSerDe implements RecordSerDe {
  private static final StringMessageFormatter FALLBACK_FORMATTER = new StringMessageFormatter();

  private final ProtobufSchema protobufSchema;
  private final Path protobufSchemaPath;
  private final ProtobufSchemaConverter schemaConverter = new ProtobufSchemaConverter();
  private final Map<String, Descriptor> messageDescriptorMap;
  private final Map<String, Descriptor> keyMessageDescriptorMap;
  private final Descriptor defaultMessageDescriptor;
  private final Descriptor defaultKeyMessageDescriptor;

  public ProtobufFileRecordSerDe(Path protobufSchemaPath, Map<String, String> messageNameMap,
                                 Map<String, String> keyMessageNameMap, String defaultMessageName,
                                 @Nullable String defaultKeyMessageName)
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
    var builder = DeserializedKeyValue.builder();

    if (msg.key() != null) {
      Descriptor descriptor = getKeyDescriptor(msg.topic());
      if (descriptor == null) {
        builder.key(FALLBACK_FORMATTER.format(msg.topic(), msg.key().get()));
        builder.keyFormat(FALLBACK_FORMATTER.getFormat());
      } else {
        try {
          builder.key(parse(msg.key().get(), descriptor));
          builder.keyFormat(MessageFormat.PROTOBUF);
        } catch (Throwable e) {
          log.debug("Failed to deserialize key as protobuf, falling back to string formatter", e);
          builder.key(FALLBACK_FORMATTER.format(msg.topic(), msg.key().get()));
          builder.keyFormat(FALLBACK_FORMATTER.getFormat());
        }
      }
    }

    if (msg.value() != null) {
      try {
        builder.value(parse(msg.value().get(), getDescriptor(msg.topic())));
        builder.valueFormat(MessageFormat.PROTOBUF);
      } catch (Throwable e) {
        log.debug("Failed to deserialize value as protobuf, falling back to string formatter", e);
        builder.key(FALLBACK_FORMATTER.format(msg.topic(), msg.value().get()));
        builder.keyFormat(FALLBACK_FORMATTER.getFormat());
      }
    }

    return builder.build();
  }

  @Nullable
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
    byte[] keyPayload = null;
    byte[] valuePayload = null;

    if (key != null) {
      Descriptor keyDescriptor = getKeyDescriptor(topic);
      if (keyDescriptor == null) {
        keyPayload = key.getBytes();
      } else {
        DynamicMessage.Builder builder = DynamicMessage.newBuilder(keyDescriptor);
        try {
          JsonFormat.parser().merge(key, builder);
          keyPayload = builder.build().toByteArray();
        } catch (Throwable e) {
          throw new RuntimeException("Failed to merge record key for topic " + topic, e);
        }
      }
    }

    if (data != null) {
      DynamicMessage.Builder builder = DynamicMessage.newBuilder(getDescriptor(topic));
      try {
        JsonFormat.parser().merge(data, builder);
        valuePayload = builder.build().toByteArray();
      } catch (Throwable e) {
        throw new RuntimeException("Failed to merge record value for topic " + topic, e);
      }
    }

    return new ProducerRecord<>(
        topic,
        partition,
        keyPayload,
        valuePayload);
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {
    JsonSchema keyJsonSchema;

    Descriptor keyDescriptor = getKeyDescriptor(topic);
    if (keyDescriptor == null) {
      keyJsonSchema = JsonSchema.stringSchema();
    } else {
      keyJsonSchema = schemaConverter.convert(
          protobufSchemaPath.toUri(),
          keyDescriptor);
    }

    final MessageSchemaDTO keySchema = new MessageSchemaDTO()
        .name(protobufSchema.fullName())
        .source(MessageSchemaDTO.SourceEnum.PROTO_FILE)
        .schema(keyJsonSchema.toJson());

    final JsonSchema valueJsonSchema = schemaConverter.convert(
        protobufSchemaPath.toUri(),
        getDescriptor(topic));

    final MessageSchemaDTO valueSchema = new MessageSchemaDTO()
        .name(protobufSchema.fullName())
        .source(MessageSchemaDTO.SourceEnum.PROTO_FILE)
        .schema(valueJsonSchema.toJson());

    return new TopicMessageSchemaDTO()
        .key(keySchema)
        .value(valueSchema);
  }
}
