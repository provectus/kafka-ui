package com.provectus.kafka.ui.serde.schemaregistry;


import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchema;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.jsonschema.AvroJsonSchemaConverter;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

@Log4j2
public class SchemaRegistryAwareRecordSerDe implements RecordSerDe {

  private static final int CLIENT_IDENTITY_MAP_CAPACITY = 100;

  private final KafkaCluster cluster;
  private final Map<String, MessageFormatter> valueFormatMap = new ConcurrentHashMap<>();
  private final Map<String, MessageFormatter> keyFormatMap = new ConcurrentHashMap<>();

  @Nullable
  private final SchemaRegistryClient schemaRegistryClient;

  @Nullable
  private final AvroMessageFormatter avroFormatter;

  @Nullable
  private final ProtobufMessageFormatter protobufFormatter;

  @Nullable
  private final JsonSchemaMessageFormatter jsonSchemaMessageFormatter;

  private final StringMessageFormatter stringFormatter = new StringMessageFormatter();
  private final ProtobufSchemaConverter protoSchemaConverter = new ProtobufSchemaConverter();
  private final AvroJsonSchemaConverter avroSchemaConverter = new AvroJsonSchemaConverter();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private static SchemaRegistryClient createSchemaRegistryClient(KafkaCluster cluster) {
    Objects.requireNonNull(cluster.getSchemaRegistry());
    Objects.requireNonNull(cluster.getSchemaRegistry().getUrl());
    List<SchemaProvider> schemaProviders =
        List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider(), new JsonSchemaProvider());

    Map<String, String> configs = new HashMap<>();
    String username = cluster.getSchemaRegistry().getUsername();
    String password = cluster.getSchemaRegistry().getPassword();

    if (username != null && password != null) {
      configs.put(BASIC_AUTH_CREDENTIALS_SOURCE, "USER_INFO");
      configs.put(USER_INFO_CONFIG, username + ":" + password);
    } else if (username != null) {
      throw new ValidationException(
          "You specified username but do not specified password");
    } else if (password != null) {
      throw new ValidationException(
          "You specified password but do not specified username");
    }
    return new CachedSchemaRegistryClient(
        Collections.singletonList(cluster.getSchemaRegistry().getUrl()),
        CLIENT_IDENTITY_MAP_CAPACITY,
        schemaProviders,
        configs
    );
  }

  public SchemaRegistryAwareRecordSerDe(KafkaCluster cluster) {
    this.cluster = cluster;
    this.schemaRegistryClient = cluster.getSchemaRegistry() != null
        ? createSchemaRegistryClient(cluster)
        : null;
    if (schemaRegistryClient != null) {
      this.avroFormatter = new AvroMessageFormatter(schemaRegistryClient);
      this.protobufFormatter = new ProtobufMessageFormatter(schemaRegistryClient);
      this.jsonSchemaMessageFormatter = new JsonSchemaMessageFormatter(schemaRegistryClient);
    } else {
      this.avroFormatter = null;
      this.protobufFormatter = null;
      this.jsonSchemaMessageFormatter = null;
    }
  }

  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      return new DeserializedKeyValue(
          msg.key() != null
              ? getMessageFormatter(msg, true).format(msg.topic(), msg.key().get())
              : null,
          msg.value() != null
              ? getMessageFormatter(msg, false).format(msg.topic(), msg.value().get())
              : null
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable String key,
                                                  @Nullable String data,
                                                  @Nullable Integer partition) {
    final Optional<SchemaMetadata> maybeValueSchema = getSchemaBySubject(topic, false);
    final Optional<SchemaMetadata> maybeKeySchema = getSchemaBySubject(topic, true);

    final byte[] serializedValue = data != null
        ? serialize(maybeValueSchema, topic, data, false)
        : null;
    final byte[] serializedKey = key != null
        ? serialize(maybeKeySchema, topic, key, true)
        : null;

    return new ProducerRecord<>(topic, partition, serializedKey, serializedValue);
  }

  @SneakyThrows
  private byte[] serialize(
      Optional<SchemaMetadata> maybeSchema, String topic, String value, boolean isKey) {
    if (maybeSchema.isPresent()) {
      final SchemaMetadata schema = maybeSchema.get();

      MessageReader<?> reader;
      if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
        reader = new ProtobufMessageReader(topic, isKey, schemaRegistryClient, schema);
      } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
        reader = new AvroMessageReader(topic, isKey, schemaRegistryClient, schema);
      } else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
        reader = new JsonSchemaMessageReader(topic, isKey, schemaRegistryClient, schema);
      } else {
        throw new IllegalStateException("Unsupported schema type: " + schema.getSchemaType());
      }

      return reader.read(value);
    } else {
      // if no schema provided serialize input as raw string
      return value.getBytes();
    }
  }

  @Override
  public TopicMessageSchema getTopicSchema(String topic) {
    final Optional<SchemaMetadata> maybeValueSchema = getSchemaBySubject(topic, false);
    final Optional<SchemaMetadata> maybeKeySchema = getSchemaBySubject(topic, true);

    String sourceValueSchema = maybeValueSchema.map(this::convertSchema)
        .orElseGet(() -> JsonSchema.stringSchema().toJson(objectMapper));

    String sourceKeySchema = maybeKeySchema.map(this::convertSchema)
        .orElseGet(() -> JsonSchema.stringSchema().toJson(objectMapper));

    final MessageSchema keySchema = new MessageSchema()
        .name(maybeKeySchema.map(
            (s) -> schemaSubject(topic, true)
        ).orElse("unknown"))
        .source(MessageSchema.SourceEnum.SCHEMA_REGISTRY)
        .schema(sourceKeySchema);

    final MessageSchema valueSchema = new MessageSchema()
        .name(maybeValueSchema.map(
            (s) -> schemaSubject(topic, false)
        ).orElse("unknown"))
        .source(MessageSchema.SourceEnum.SCHEMA_REGISTRY)
        .schema(sourceValueSchema);

    return new TopicMessageSchema()
        .key(keySchema)
        .value(valueSchema);
  }

  @SneakyThrows
  private String convertSchema(SchemaMetadata schema) {

    String jsonSchema;
    URI basePath = new URI(cluster.getSchemaRegistry().getUrl())
        .resolve(Integer.toString(schema.getId()));
    final ParsedSchema schemaById = Objects.requireNonNull(schemaRegistryClient)
        .getSchemaById(schema.getId());

    if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
      final ProtobufSchema protobufSchema = (ProtobufSchema) schemaById;
      jsonSchema = protoSchemaConverter
          .convert(basePath, protobufSchema.toDescriptor())
          .toJson(objectMapper);
    } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
      final AvroSchema avroSchema = (AvroSchema) schemaById;
      jsonSchema = avroSchemaConverter
          .convert(basePath, avroSchema.rawSchema())
          .toJson(objectMapper);
    } else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
      jsonSchema = schema.getSchema();
    } else {
      jsonSchema = JsonSchema.stringSchema().toJson(objectMapper);
    }

    return jsonSchema;
  }

  private MessageFormatter getMessageFormatter(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    if (isKey) {
      return keyFormatMap.computeIfAbsent(msg.topic(), k -> detectFormat(msg, true));
    } else {
      return valueFormatMap.computeIfAbsent(msg.topic(), k -> detectFormat(msg, false));
    }
  }

  private MessageFormatter detectFormat(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    if (schemaRegistryClient != null) {
      try {
        final Optional<String> type = getSchemaFromMessage(msg, isKey)
            .or(() -> getSchemaBySubject(msg.topic(), isKey).map(SchemaMetadata::getSchemaType));
        if (type.isPresent()) {
          if (type.get().equals(MessageFormat.PROTOBUF.name())) {
            if (tryFormatter(protobufFormatter, msg, isKey).isPresent()) {
              return protobufFormatter;
            }
          } else if (type.get().equals(MessageFormat.AVRO.name())) {
            if (tryFormatter(avroFormatter, msg, isKey).isPresent()) {
              return avroFormatter;
            }
          } else if (type.get().equals(MessageFormat.JSON.name())) {
            if (tryFormatter(jsonSchemaMessageFormatter, msg, isKey).isPresent()) {
              return jsonSchemaMessageFormatter;
            }
          } else {
            throw new IllegalStateException("Unsupported schema type: " + type.get());
          }
        }
      } catch (Exception e) {
        log.warn("Failed to get Schema for topic {}", msg.topic(), e);
      }
    }
    return stringFormatter;
  }

  private Optional<MessageFormatter> tryFormatter(
      MessageFormatter formatter, ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    try {
      formatter.format(msg.topic(), isKey ? msg.key().get() : msg.value().get());
      return Optional.of(formatter);
    } catch (Throwable e) {
      log.warn("Failed to parse by {} from topic {}", formatter.getClass(), msg.topic(), e);
    }

    return Optional.empty();
  }

  @SneakyThrows
  private Optional<String> getSchemaFromMessage(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    Optional<String> result = Optional.empty();
    final Bytes value = isKey ? msg.key() : msg.value();
    if (value != null) {
      ByteBuffer buffer = ByteBuffer.wrap(value.get());
      if (buffer.get() == 0) {
        int id = buffer.getInt();
        result =
            Optional.ofNullable(schemaRegistryClient)
                .flatMap(client -> wrapClientCall(() -> client.getSchemaById(id)))
                .map(ParsedSchema::schemaType);
      }
    }
    return result;
  }

  @SneakyThrows
  private Optional<SchemaMetadata> getSchemaBySubject(String topic, boolean isKey) {
    return Optional.ofNullable(schemaRegistryClient)
        .flatMap(client ->
            wrapClientCall(() ->
                client.getLatestSchemaMetadata(schemaSubject(topic, isKey))));
  }

  @SneakyThrows
  private <T> Optional<T> wrapClientCall(Callable<T> call) {
    try {
      return Optional.ofNullable(call.call());
    } catch (RestClientException restClientException) {
      if (restClientException.getStatus() == 404) {
        return Optional.empty();
      } else {
        throw new RuntimeException("Error calling SchemaRegistryClient", restClientException);
      }
    }
  }

  private String schemaSubject(String topic, boolean isKey) {
    return String.format(
        isKey ? cluster.getKeySchemaNameTemplate()
            : cluster.getSchemaNameTemplate(), topic
    );
  }
}
