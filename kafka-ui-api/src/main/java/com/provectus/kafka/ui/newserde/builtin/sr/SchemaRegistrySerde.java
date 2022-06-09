package com.provectus.kafka.ui.newserde.builtin.sr;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.newserde.builtin.BuiltInSerde;
import com.provectus.kafka.ui.newserde.spi.DeserializeResult;
import com.provectus.kafka.ui.newserde.spi.PropertyResolver;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import com.provectus.kafka.ui.util.jsonschema.AvroJsonSchemaConverter;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import lombok.SneakyThrows;
import org.apache.kafka.common.header.Headers;

import javax.annotation.Nullable;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

public class SchemaRegistrySerde implements BuiltInSerde {

  private static final ProtobufSchemaConverter PROTOBUF_SCHEMA_CONVERTER = new ProtobufSchemaConverter();
  private static final AvroJsonSchemaConverter AVRO_JSON_SCHEMA_CONVERTER = new AvroJsonSchemaConverter();

  private SchemaRegistryClient schemaRegistryClient;
  private List<String> schemaRegistryUrls;
  private String valueSchemaNameTemplate;
  private String keySchemaNameTemplate;

  private Map<MessageFormat, MessageFormatter> schemaRegistryFormatters;

  @Override
  public boolean initOnStartup(PropertyResolver kafkaClusterProperties,
                               PropertyResolver globalProperties) {
    return kafkaClusterProperties.getListProperty("schemaRegistry", String.class)
        .filter(lst -> !lst.isEmpty())
        .isPresent();
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    var urls = serdeProperties.getListProperty("url", String.class)
        .or(() -> kafkaClusterProperties.getListProperty("schemaRegistry", String.class))
        .filter(lst -> !lst.isEmpty())
        .orElseThrow(() -> new ValidationException("No urls provided for schema registry"));
    configure(
        urls,
        createSchemaRegistryClient(
            urls,
            serdeProperties.getProperty("username", String.class)
                .or(() -> kafkaClusterProperties.getProperty("schemaRegistryAuth.username", String.class))
                .orElse(null),
            serdeProperties.getProperty("password", String.class)
                .or(() -> kafkaClusterProperties.getProperty("schemaRegistryAuth.password", String.class))
                .orElse(null)
        ),
        serdeProperties.getProperty("keySchemaNameTemplate", String.class)
            .or(() -> kafkaClusterProperties.getProperty("keySchemaNameTemplate", String.class))
            .orElse("%s-key"),
        serdeProperties.getProperty("schemaNameTemplate", String.class)
            .or(() -> kafkaClusterProperties.getProperty("schemaNameTemplate", String.class))
            .orElse("%s-value")
    );
  }

  @VisibleForTesting
  void configure(
      List<String> schemaRegistryUrls,
      SchemaRegistryClient schemaRegistryClient,
      String keySchemaNameTemplate,
      String valueSchemaNameTemplate) {
    this.schemaRegistryUrls = schemaRegistryUrls;
    this.schemaRegistryClient = schemaRegistryClient;
    this.keySchemaNameTemplate = keySchemaNameTemplate;
    this.valueSchemaNameTemplate = valueSchemaNameTemplate;
    this.schemaRegistryFormatters = Map.of(
        MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryClient),
        MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryClient),
        MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryClient)
    );
  }

  private static SchemaRegistryClient createSchemaRegistryClient(List<String> urls,
                                                                 @Nullable String username,
                                                                 @Nullable String password) {
    Map<String, String> configs = new HashMap<>();
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
        urls.stream().collect(Collectors.toUnmodifiableList()),
        1_000,
        List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider(), new JsonSchemaProvider()),
        configs
    );
  }

  @Override
  public Optional<String> description() {
    //TODO add
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, Type type) {
    return true;
  }

  @Override
  public boolean canSerialize(String topic, Type type) {
    String subject = schemaSubject(topic, type);
    return getSchemaBySubject(subject).isPresent();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Type type) {
    String subject = schemaSubject(topic, type);
    return getSchemaBySubject(subject)
        .map(schemaMetadata ->
            new SchemaDescription(
                convertSchema(schemaMetadata),
                Map.of(
                    "schemaId", schemaMetadata.getId(),
                    "latestVersion", schemaMetadata.getVersion(),
                    "type", schemaMetadata.getSchemaType() // AVRO / PROTOBUF / JSON
                )
            ));
  }

  @SneakyThrows
  private String convertSchema(SchemaMetadata schema) {
    String jsonSchema;
    URI basePath = new URI(schemaRegistryUrls.get(0))
        .resolve(Integer.toString(schema.getId()));

    final ParsedSchema schemaById = schemaRegistryClient.getSchemaById(schema.getId());

    if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
      final ProtobufSchema protobufSchema = (ProtobufSchema) schemaById;
      jsonSchema = PROTOBUF_SCHEMA_CONVERTER
          .convert(basePath, protobufSchema.toDescriptor())
          .toJson();
    } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
      final AvroSchema avroSchema = (AvroSchema) schemaById;
      jsonSchema = AVRO_JSON_SCHEMA_CONVERTER
          .convert(basePath, avroSchema.rawSchema())
          .toJson();
    } else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
      jsonSchema = schema.getSchema();
    } else {
      throw new IllegalStateException("Unknown schema type: " + schema.getSchemaType());
    }

    return jsonSchema;
  }

  private Optional<SchemaMetadata> getSchemaBySubject(String subject) {
    return wrapWith404Handler(() -> schemaRegistryClient.getLatestSchemaMetadata(subject));
  }

  @SneakyThrows
  private <T> Optional<T> wrapWith404Handler(Callable<T> call) {
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

  private String schemaSubject(String topic, Type type) {
    return String.format(type == Type.KEY ? keySchemaNameTemplate : valueSchemaNameTemplate, topic);
  }

  @Override
  public Serializer serializer(String topic, Type type) {
    String subject = schemaSubject(topic, type);
    var schema = getSchemaBySubject(subject)
        .orElseThrow(() -> new ValidationException(String.format("No schema for subject '%s' found", subject)));
    boolean isKey = type == Type.KEY;
    if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
      return new ProtobufSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
    } else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
      return new AvroSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
    } else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
      return new JsonSchemaSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
    } else {
      throw new IllegalStateException("Unsupported schema type: " + schema.getSchemaType());
    }
  }

  @Override
  public Deserializer deserializer(String topic, Type type) {
    return new SrDeserializer();
  }

  ///--------------------------------------------------------------

  private static final byte SR_RECORD_MAGIC_BYTE = (byte) 0;
  private static final int SR_RECORD_PREFIX_LENGTH = 5;

  private class SrDeserializer implements Deserializer {

    @Override
    public DeserializeResult deserialize(String topic, Headers headers, byte[] data) {
      var schemaId = extractSchemaIdFromMsg(data);
      MessageFormat format = getMessageFormatBySchemaId(schemaId);
      MessageFormatter formatter = schemaRegistryFormatters.get(format);
      return new DeserializeResult(
          formatter.format(topic, data),
          DeserializeResult.Type.JSON, //TODO not always true actually
          Map.of(
              "schemaId", schemaId,
              "type", format.name()
          )
      );
    }
  }

  private MessageFormat getMessageFormatBySchemaId(int schemaId) {
    return wrapWith404Handler(() -> schemaRegistryClient.getSchemaById(schemaId))
        .map(ParsedSchema::schemaType)
        .flatMap(MessageFormat::fromString)
        .orElseThrow(() -> new ValidationException(String.format("Schema for id '%d' not found ", schemaId)));
  }

  private int extractSchemaIdFromMsg(byte[] data) {
    ByteBuffer buffer = ByteBuffer.wrap(data);
    if (buffer.remaining() > SR_RECORD_PREFIX_LENGTH && buffer.get() == SR_RECORD_MAGIC_BYTE) {
      return buffer.getInt();
    }
    throw new ValidationException(
        String.format(
            "Data doesn't contain magic byte and schema id prefix, so it can't be deserialized with %s",
            this.getClass().getSimpleName())
    );
  }
}
