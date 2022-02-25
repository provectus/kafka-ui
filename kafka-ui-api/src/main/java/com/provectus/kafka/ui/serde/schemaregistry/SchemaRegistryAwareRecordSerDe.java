package com.provectus.kafka.ui.serde.schemaregistry;


import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.serde.RecordSerDe.DeserializedKeyValue.DeserializedKeyValueBuilder;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import javax.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class SchemaRegistryAwareRecordSerDe implements RecordSerDe {

  private static final StringMessageFormatter FALLBACK_FORMATTER = new StringMessageFormatter();

  private static final ProtobufSchemaConverter protoSchemaConverter = new ProtobufSchemaConverter();
  private static final AvroJsonSchemaConverter avroSchemaConverter = new AvroJsonSchemaConverter();

  private final KafkaCluster cluster;
  private final SchemaRegistryClient schemaRegistryClient;

  private final Map<MessageFormat, MessageFormatter> schemaRegistryFormatters;

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
        1_000,
        schemaProviders,
        configs
    );
  }

  public SchemaRegistryAwareRecordSerDe(KafkaCluster cluster) {
    this(cluster, createSchemaRegistryClient(cluster));
  }

  @VisibleForTesting
  SchemaRegistryAwareRecordSerDe(KafkaCluster cluster, SchemaRegistryClient schemaRegistryClient) {
    this.cluster = cluster;
    this.schemaRegistryClient = schemaRegistryClient;
    this.schemaRegistryFormatters = Map.of(
        MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryClient),
        MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryClient),
        MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryClient)
    );
  }

  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    try {
      DeserializedKeyValueBuilder builder = DeserializedKeyValue.builder();
      if (msg.key() != null) {
        fillDeserializedKvBuilder(msg, true, builder);
      }
      if (msg.value() != null) {
        fillDeserializedKvBuilder(msg, false, builder);
      }
      return builder.build();
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  private void fillDeserializedKvBuilder(ConsumerRecord<Bytes, Bytes> rec,
                                         boolean isKey,
                                         DeserializedKeyValueBuilder builder) {
    Optional<Integer> schemaId = extractSchemaIdFromMsg(rec, isKey);
    Optional<MessageFormat> format = schemaId.flatMap(this::getMessageFormatBySchemaId);
    if (schemaId.isPresent() && format.isPresent() && schemaRegistryFormatters.containsKey(format.get())) {
      var formatter = schemaRegistryFormatters.get(format.get());
      try {
        var deserialized = formatter.format(rec.topic(), isKey ? rec.key().get() : rec.value().get());
        if (isKey) {
          builder.key(deserialized);
          builder.keyFormat(formatter.getFormat());
          builder.keySchemaId(String.valueOf(schemaId.get()));
        } else {
          builder.value(deserialized);
          builder.valueFormat(formatter.getFormat());
          builder.valueSchemaId(String.valueOf(schemaId.get()));
        }
        return;
      } catch (Exception e) {
        log.trace("Can't deserialize record {} with formatter {}",
            rec, formatter.getClass().getSimpleName(), e);
      }
    }

    // fallback
    if (isKey) {
      builder.key(FALLBACK_FORMATTER.format(rec.topic(), rec.key().get()));
      builder.keyFormat(FALLBACK_FORMATTER.getFormat());
    } else {
      builder.value(FALLBACK_FORMATTER.format(rec.topic(), rec.value().get()));
      builder.valueFormat(FALLBACK_FORMATTER.getFormat());
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
            s -> schemaSubject(topic, true)
        ).orElse("unknown"))
        .source(MessageSchemaDTO.SourceEnum.SCHEMA_REGISTRY)
        .schema(sourceKeySchema);

    final MessageSchemaDTO valueSchema = new MessageSchemaDTO()
        .name(maybeValueSchema.map(
            s -> schemaSubject(topic, false)
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

  private Optional<MessageFormat> getMessageFormatBySchemaId(int schemaId) {
    return wrapClientCall(() -> schemaRegistryClient.getSchemaById(schemaId))
        .map(ParsedSchema::schemaType)
        .flatMap(MessageFormat::fromString);
  }

  private Optional<Integer> extractSchemaIdFromMsg(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    Bytes bytes = isKey ? msg.key() : msg.value();
    ByteBuffer buffer = ByteBuffer.wrap(bytes.get());
    if (buffer.get() == 0 && buffer.remaining() > 4) {
      int id = buffer.getInt();
      return Optional.of(id);
    }
    return Optional.empty();
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
