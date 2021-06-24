package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.RecordSerDe;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.entities.Schema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Log4j2
public class SchemaRegistryRecordSerDe implements RecordSerDe {

  private static final int CLIENT_IDENTITY_MAP_CAPACITY = 100;

  private final KafkaCluster cluster;
  private final SchemaRegistryClient schemaRegistryClient;
  private final Map<String, MessageFormatter> valueFormatMap = new ConcurrentHashMap<>();
  private final Map<String, MessageFormatter> keyFormatMap = new ConcurrentHashMap<>();

  private AvroMessageFormatter avroFormatter;
  private ProtobufMessageFormatter protobufFormatter;
  private final JsonMessageFormatter jsonFormatter;
  private final StringMessageFormatter stringFormatter = new StringMessageFormatter();

  public SchemaRegistryRecordSerDe(KafkaCluster cluster, ObjectMapper objectMapper) {
    this.cluster = cluster;

    this.schemaRegistryClient = Optional.ofNullable(cluster.getSchemaRegistry())
        .map(schemaRegistryUrl -> {
              List<SchemaProvider> schemaProviders =
                  List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider());
              return new CachedSchemaRegistryClient(
                  Collections.singletonList(schemaRegistryUrl),
                  CLIENT_IDENTITY_MAP_CAPACITY,
                  schemaProviders,
                  Collections.emptyMap()
              );
            }
        ).orElse(null);

    this.jsonFormatter = new JsonMessageFormatter(objectMapper);

    if (schemaRegistryClient != null) {
      this.avroFormatter = new AvroMessageFormatter(schemaRegistryClient, objectMapper);
      this.protobufFormatter = new ProtobufMessageFormatter(schemaRegistryClient);
    }
  }

  public Tuple2<String, Object> deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    MessageFormatter valueFormatter = getMessageFormatter(msg, false);
    MessageFormatter keyFormatter = getMessageFormatter(msg, true);
    try {
      return Tuples.of(
          msg.key() != null
              ? keyFormatter.format(msg.topic(), msg.key().get()).toString()
              : "",
          valueFormatter.format(
              msg.topic(),
              msg.value() != null ? msg.value().get() : null
          )
      );
    } catch (Throwable e) {
      throw new RuntimeException("Failed to parse record from topic " + msg.topic(), e);
    }
  }

  @Override
  @SneakyThrows
  public ProducerRecord<byte[], byte[]> serialize(String topic, byte[] key, byte[] data,
                                                  Optional<Integer> partition) {
    final Optional<Schema> maybeValueSchema = getSchemaBySubject(topic, false);
    final Optional<Schema> maybeKeySchema = getSchemaBySubject(topic, true);

    final Optional<byte[]> serializedValue = serialize(maybeValueSchema, topic, data);
    final Optional<byte[]> serializedKey = serialize(maybeKeySchema, topic, key);

    if (serializedValue.isPresent()) {
      return partition
          .map(p ->
              new ProducerRecord<>(topic, p, serializedKey.orElse(key), serializedValue.get())
          ).orElseGet(() ->
              new ProducerRecord<>(topic, serializedKey.orElse(key), serializedValue.get())
          );
    } else {
      throw new RuntimeException("Subject was not found for topic " + topic);
    }
  }

  @SneakyThrows
  private Optional<byte[]> serialize(Optional<Schema> maybeSchema, String topic, byte[] value) {
    if (maybeSchema.isPresent()) {
      final Schema schema = maybeSchema.get();

      MessageReader<?> reader;
      if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
        reader = new ProtobufMessageReader(topic, false, schemaRegistryClient, schema);
      } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
        reader = new AvroMessageReader(topic, false, schemaRegistryClient, schema);
      } else {
        reader = new JsonMessageReader(topic, false, schemaRegistryClient, schema);
      }

      return Optional.of(reader.read(value));
    } else {
      return Optional.empty();
    }

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
            .or(() -> getSchemaBySubject(msg.topic(), isKey).map(Schema::getSchemaType));
        if (type.isPresent()) {
          if (type.get().equals(MessageFormat.PROTOBUF.name())) {
            try {
              protobufFormatter.format(msg.topic(), msg.value().get());
              return protobufFormatter;
            } catch (Throwable e) {
              log.info("Failed to get Protobuf schema for topic {}", msg.topic(), e);
            }
          } else if (type.get().equals(MessageFormat.AVRO.name())) {
            try {
              avroFormatter.format(msg.topic(), msg.value().get());
              return avroFormatter;
            } catch (Throwable e) {
              log.info("Failed to get Avro schema for topic {}", msg.topic(), e);
            }
          } else if (type.get().equals(MessageFormat.JSON.name())) {
            try {
              jsonFormatter.format(msg.topic(), msg.value().get());
              return jsonFormatter;
            } catch (Throwable e) {
              log.info("Failed to parse json from topic {}", msg.topic());
            }
          }
        }
      } catch (Exception e) {
        log.warn("Failed to get Schema for topic {}", msg.topic(), e);
      }
    }

    try {
      jsonFormatter.format(msg.topic(), msg.value().get());
      return jsonFormatter;
    } catch (Throwable e) {
      log.info("Failed to parse json from topic {}", msg.topic());
    }

    return stringFormatter;
  }

  @SneakyThrows
  private Optional<String> getSchemaFromMessage(ConsumerRecord<Bytes, Bytes> msg, boolean isKey) {
    Optional<String> result = Optional.empty();
    final Bytes value = isKey ? msg.key() : msg.value();
    if (value != null) {
      ByteBuffer buffer = ByteBuffer.wrap(value.get());
      if (buffer.get() == 0) {
        int id = buffer.getInt();
        result = Optional.ofNullable(
            schemaRegistryClient.getSchemaById(id)
        ).map(ParsedSchema::schemaType);
      }
    }
    return result;
  }

  @SneakyThrows
  private Optional<Schema> getSchemaBySubject(String topic, boolean isKey) {

    String schemaName = String.format(
        isKey ? cluster.getKeySchemaNameTemplate()
            : cluster.getSchemaNameTemplate(), topic
    );

    final List<Integer> versions = schemaRegistryClient.getAllVersions(schemaName);
    if (!versions.isEmpty()) {
      final Integer version = versions.get(versions.size() - 1);
      final String subjectName = String.format(cluster.getSchemaNameTemplate(), topic);
      final Schema schema = schemaRegistryClient.getByVersion(subjectName, version, false);
      return Optional.ofNullable(schema);
    } else {
      return Optional.empty();
    }
  }
}
