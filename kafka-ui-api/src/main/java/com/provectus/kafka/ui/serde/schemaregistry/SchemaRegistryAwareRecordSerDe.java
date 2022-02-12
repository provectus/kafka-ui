package com.provectus.kafka.ui.serde.schemaregistry;


import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
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
import java.util.*;
import java.util.concurrent.Callable;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class SchemaRegistryAwareRecordSerDe implements RecordSerDe {

  private static final int CLIENT_IDENTITY_MAP_CAPACITY = 10_000;

  private static final ProtobufSchemaConverter protoSchemaConverter = new ProtobufSchemaConverter();
  private static final AvroJsonSchemaConverter avroSchemaConverter = new AvroJsonSchemaConverter();

  private final KafkaCluster cluster;
  private final SchemaRegistryClient schemaRegistryClient;

  private final Map<MessageFormat, MessageFormatter> schemaRegistryFormatters;
  private final StringMessageFormatter fallbackFormatter = new StringMessageFormatter();

  private static SchemaRegistryClient createSchemaRegistryClient(KafkaCluster cluster) {
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
        cluster.getSchemaRegistry().getUrl(),
        CLIENT_IDENTITY_MAP_CAPACITY,
        schemaProviders,
        configs
    );
  }

  public SchemaRegistryAwareRecordSerDe(KafkaCluster cluster) {
    this.cluster = cluster;
    this.schemaRegistryClient = createSchemaRegistryClient(cluster);
    this.schemaRegistryFormatters = Map.of(
        MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryClient),
        MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryClient),
        MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryClient)
    );
  }

  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      var builder = DeserializedKeyValue.builder();
      if (msg.key() != null) {
        DeserResult keyDeser = deserialize(msg, true);
        builder.key(keyDeser.result);
        builder.keyFormat(keyDeser.format);
        builder.keySchemaId(keyDeser.schemaId);
      }
      if (msg.value() != null) {
        DeserResult valueDeser = deserialize(msg, false);
        builder.value(valueDeser.result);
        builder.valueFormat(valueDeser.format);
        builder.valueSchemaId(valueDeser.schemaId);
      }
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable String key,
                                                  @Nullable String data,
                                                  @Nullable Integer partition) {
    final Optional<SchemaMetadata> maybeKeySchema = getSchemaBySubject(topic, true);
    final Optional<SchemaMetadata> maybeValueSchema = getSchemaBySubject(topic, false);

    final byte[] serializedKey = maybeKeySchema.isPresent()
        ? serialize(maybeKeySchema.get(), topic, key, true)
        : serialize(key);

    final byte[] serializedValue = maybeValueSchema.isPresent()
        ? serialize(maybeValueSchema.get(), topic, data, false)
        : serialize(data);

    return new ProducerRecord<>(topic, partition, serializedKey, serializedValue);
  }

  @SneakyThrows
  private byte[] serialize(SchemaMetadata schema, String topic, String value, boolean isKey) {
    if (value == null) {
      return null;
    }
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
  }

  private byte[] serialize(String value) {
    if (value == null) {
      return null;
    }
    // if no schema provided serialize input as raw string
    return value.getBytes();
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {
    final Optional<SchemaMetadata> maybeValueSchema = getSchemaBySubject(topic, false);
    final Optional<SchemaMetadata> maybeKeySchema = getSchemaBySubject(topic, true);

    String sourceValueSchema = maybeValueSchema.map(this::convertSchema)
        .orElseGet(() -> JsonSchema.stringSchema().toJson());

    String sourceKeySchema = maybeKeySchema.map(this::convertSchema)
        .orElseGet(() -> JsonSchema.stringSchema().toJson());

    final MessageSchemaDTO keySchema = new MessageSchemaDTO()
        .name(maybeKeySchema.map(
            (s) -> schemaSubject(topic, true)
        ).orElse("unknown"))
        .source(MessageSchemaDTO.SourceEnum.SCHEMA_REGISTRY)
        .schema(sourceKeySchema);

    final MessageSchemaDTO valueSchema = new MessageSchemaDTO()
        .name(maybeValueSchema.map(
            (s) -> schemaSubject(topic, false)
        ).orElse("unknown"))
        .source(MessageSchemaDTO.SourceEnum.SCHEMA_REGISTRY)
        .schema(sourceValueSchema);

    return new TopicMessageSchemaDTO()
        .key(keySchema)
        .value(valueSchema);
  }

  @SneakyThrows
  private String convertSchema(SchemaMetadata schema) {

    String jsonSchema;
    URI basePath = new URI(cluster.getSchemaRegistry().getFirstUrl())
        .resolve(Integer.toString(schema.getId()));
    final ParsedSchema schemaById = schemaRegistryClient.getSchemaById(schema.getId());

    if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
      final ProtobufSchema protobufSchema = (ProtobufSchema) schemaById;
      jsonSchema = protoSchemaConverter
          .convert(basePath, protobufSchema.toDescriptor())
          .toJson();
    } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
      final AvroSchema avroSchema = (AvroSchema) schemaById;
      jsonSchema = avroSchemaConverter
          .convert(basePath, avroSchema.rawSchema())
          .toJson();
    } else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
      jsonSchema = schema.getSchema();
    } else {
      jsonSchema = JsonSchema.stringSchema().toJson();
    }

    return jsonSchema;
  }

  @Value
  class DeserResult {
    String result;
    MessageFormat format;
    @Nullable String schemaId;
  }

  private DeserResult deserialize(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    OptionalInt schemaId = extractSchemaIdFromMsg(msg, isKey);
    if (schemaId.isEmpty()) {
      return fallbackDeserialize(msg, isKey);
    }
    var formatter = getMessageFormatBySchemaId(schemaId.getAsInt())
        .flatMap(fmt -> Optional.ofNullable(schemaRegistryFormatters.get(fmt)));
    if (formatter.isEmpty()) {
      return fallbackDeserialize(msg, isKey);
    }
    return deserializeWithFallback(msg, isKey, formatter.get(), schemaId.getAsInt());
  }

  private DeserResult deserializeWithFallback(ConsumerRecord<Bytes, Bytes> msg,
                                              boolean isKey,
                                              MessageFormatter formatter,
                                              Integer schemaId) {
    try {
      return new DeserResult(
          formatter.format(msg.topic(), isKey ? msg.key().get() : msg.value().get()),
          formatter.getFormat(),
          String.valueOf(schemaId)
      );
    } catch (Exception e) {
      log.trace("Can't deserialize record {} with formatter {}", msg, formatter.getClass().getSimpleName(), e);
      return fallbackDeserialize(msg, isKey);
    }
  }

  private DeserResult fallbackDeserialize(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    return new DeserResult(
        fallbackFormatter.format(msg.topic(), isKey ? msg.key().get() : msg.value().get()),
        fallbackFormatter.getFormat(),
        null
    );
  }

  private Optional<MessageFormat> getMessageFormatBySchemaId(int schemaId) {
    return wrapClientCall(() -> schemaRegistryClient.getSchemaById(schemaId))
        .map(ParsedSchema::schemaType)
        .flatMap(MessageFormat::fromString);
  }

  private OptionalInt extractSchemaIdFromMsg(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    Bytes bytes = isKey ? msg.key() : msg.value();
    ByteBuffer buffer = ByteBuffer.wrap(bytes.get());
    if (buffer.get() == 0 && buffer.remaining() > 4) {
      int id = buffer.getInt();
      return OptionalInt.of(id);
    }
    return OptionalInt.empty();
  }

  @SneakyThrows
  private Optional<SchemaMetadata> getSchemaBySubject(String topic, boolean isKey) {
    return wrapClientCall(() ->
        schemaRegistryClient.getLatestSchemaMetadata(schemaSubject(topic, isKey)));
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
