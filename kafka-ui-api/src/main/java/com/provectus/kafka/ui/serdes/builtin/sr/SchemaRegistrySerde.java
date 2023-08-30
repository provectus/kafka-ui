package com.provectus.kafka.ui.serdes.builtin.sr;

import static com.provectus.kafka.ui.serdes.builtin.sr.Serialize.serializeAvro;
import static com.provectus.kafka.ui.serdes.builtin.sr.Serialize.serializeJson;
import static com.provectus.kafka.ui.serdes.builtin.sr.Serialize.serializeProto;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import com.provectus.kafka.ui.util.jsonschema.AvroJsonSchemaConverter;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClientConfig;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
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
import org.apache.kafka.common.config.SslConfigs;


public class SchemaRegistrySerde implements BuiltInSerde {

  private static final byte SR_PAYLOAD_MAGIC_BYTE = 0x0;
  private static final int SR_PAYLOAD_PREFIX_LENGTH = 5;

  public static String name() {
    return "SchemaRegistry";
  }

  private static final String SCHEMA_REGISTRY = "schemaRegistry";

  private SchemaRegistryClient schemaRegistryClient;
  private List<String> schemaRegistryUrls;
  private String valueSchemaNameTemplate;
  private String keySchemaNameTemplate;
  private boolean checkSchemaExistenceForDeserialize;

  private Map<SchemaType, MessageFormatter> schemaRegistryFormatters;

  @Override
  public boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties,
                                     PropertyResolver globalProperties) {
    return kafkaClusterProperties.getListProperty(SCHEMA_REGISTRY, String.class)
        .filter(lst -> !lst.isEmpty())
        .isPresent();
  }

  @Override
  public void autoConfigure(PropertyResolver kafkaClusterProperties,
                            PropertyResolver globalProperties) {
    var urls = kafkaClusterProperties.getListProperty(SCHEMA_REGISTRY, String.class)
        .filter(lst -> !lst.isEmpty())
        .orElseThrow(() -> new ValidationException("No urls provided for schema registry"));
    configure(
        urls,
        createSchemaRegistryClient(
            urls,
            kafkaClusterProperties.getProperty("schemaRegistryAuth.username", String.class).orElse(null),
            kafkaClusterProperties.getProperty("schemaRegistryAuth.password", String.class).orElse(null),
            kafkaClusterProperties.getProperty("schemaRegistrySsl.keystoreLocation", String.class).orElse(null),
            kafkaClusterProperties.getProperty("schemaRegistrySsl.keystorePassword", String.class).orElse(null),
            kafkaClusterProperties.getProperty("ssl.truststoreLocation", String.class).orElse(null),
            kafkaClusterProperties.getProperty("ssl.truststorePassword", String.class).orElse(null)
        ),
        kafkaClusterProperties.getProperty("schemaRegistryKeySchemaNameTemplate", String.class).orElse("%s-key"),
        kafkaClusterProperties.getProperty("schemaRegistrySchemaNameTemplate", String.class).orElse("%s-value"),
        kafkaClusterProperties.getProperty("schemaRegistryCheckSchemaExistenceForDeserialize", Boolean.class)
            .orElse(false)
    );
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    var urls = serdeProperties.getListProperty("url", String.class)
        .or(() -> kafkaClusterProperties.getListProperty(SCHEMA_REGISTRY, String.class))
        .filter(lst -> !lst.isEmpty())
        .orElseThrow(() -> new ValidationException("No urls provided for schema registry"));
    configure(
        urls,
        createSchemaRegistryClient(
            urls,
            serdeProperties.getProperty("username", String.class).orElse(null),
            serdeProperties.getProperty("password", String.class).orElse(null),
            serdeProperties.getProperty("keystoreLocation", String.class).orElse(null),
            serdeProperties.getProperty("keystorePassword", String.class).orElse(null),
            kafkaClusterProperties.getProperty("ssl.truststoreLocation", String.class).orElse(null),
            kafkaClusterProperties.getProperty("ssl.truststorePassword", String.class).orElse(null)
        ),
        serdeProperties.getProperty("keySchemaNameTemplate", String.class).orElse("%s-key"),
        serdeProperties.getProperty("schemaNameTemplate", String.class).orElse("%s-value"),
        serdeProperties.getProperty("checkSchemaExistenceForDeserialize", Boolean.class)
            .orElse(false)
    );
  }

  @VisibleForTesting
  void configure(
      List<String> schemaRegistryUrls,
      SchemaRegistryClient schemaRegistryClient,
      String keySchemaNameTemplate,
      String valueSchemaNameTemplate,
      boolean checkTopicSchemaExistenceForDeserialize) {
    this.schemaRegistryUrls = schemaRegistryUrls;
    this.schemaRegistryClient = schemaRegistryClient;
    this.keySchemaNameTemplate = keySchemaNameTemplate;
    this.valueSchemaNameTemplate = valueSchemaNameTemplate;
    this.schemaRegistryFormatters = MessageFormatter.createMap(schemaRegistryClient);
    this.checkSchemaExistenceForDeserialize = checkTopicSchemaExistenceForDeserialize;
  }

  private static SchemaRegistryClient createSchemaRegistryClient(List<String> urls,
                                                                 @Nullable String username,
                                                                 @Nullable String password,
                                                                 @Nullable String keyStoreLocation,
                                                                 @Nullable String keyStorePassword,
                                                                 @Nullable String trustStoreLocation,
                                                                 @Nullable String trustStorePassword) {
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

    // We require at least a truststore. The logic is done similar to SchemaRegistryService.securedWebClientOnTLS
    if (trustStoreLocation != null && trustStorePassword != null) {
      configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG,
          trustStoreLocation);
      configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG,
          trustStorePassword);
    }

    if (keyStoreLocation != null && keyStorePassword != null) {
      configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG,
          keyStoreLocation);
      configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG,
          keyStorePassword);
      configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEY_PASSWORD_CONFIG,
          keyStorePassword);
    }

    return new CachedSchemaRegistryClient(
        urls,
        1_000,
        List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider(), new JsonSchemaProvider()),
        configs
    );
  }

  @Override
  public Optional<String> getDescription() {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    String subject = schemaSubject(topic, type);
    return !checkSchemaExistenceForDeserialize
        || getSchemaBySubject(subject).isPresent();
  }

  @Override
  public boolean canSerialize(String topic, Target type) {
    String subject = schemaSubject(topic, type);
    return getSchemaBySubject(subject).isPresent();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Target type) {
    String subject = schemaSubject(topic, type);
    return getSchemaBySubject(subject)
        .flatMap(schemaMetadata ->
            //schema can be not-found, when schema contexts configured improperly
            getSchemaById(schemaMetadata.getId())
                .map(parsedSchema ->
                    new SchemaDescription(
                        convertSchema(schemaMetadata, parsedSchema),
                        Map.of(
                            "subject", subject,
                            "schemaId", schemaMetadata.getId(),
                            "latestVersion", schemaMetadata.getVersion(),
                            "type", schemaMetadata.getSchemaType() // AVRO / PROTOBUF / JSON
                        )
                    )));
  }

  @SneakyThrows
  private String convertSchema(SchemaMetadata schema, ParsedSchema parsedSchema) {
    URI basePath = new URI(schemaRegistryUrls.get(0))
        .resolve(Integer.toString(schema.getId()));
    SchemaType schemaType = SchemaType.fromString(schema.getSchemaType())
        .orElseThrow(() -> new IllegalStateException("Unknown schema type: " + schema.getSchemaType()));
    return switch (schemaType) {
      case PROTOBUF -> new ProtobufSchemaConverter()
          .convert(basePath, ((ProtobufSchema) parsedSchema).toDescriptor())
          .toJson();
      case AVRO -> new AvroJsonSchemaConverter()
          .convert(basePath, ((AvroSchema) parsedSchema).rawSchema())
          .toJson();
      case JSON ->
          //need to use confluent JsonSchema since it includes resolved references
          ((JsonSchema) parsedSchema).rawSchema().toString();
    };
  }

  private Optional<ParsedSchema> getSchemaById(int id) {
    return wrapWith404Handler(() -> schemaRegistryClient.getSchemaById(id));
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

  private String schemaSubject(String topic, Target type) {
    return String.format(type == Target.KEY ? keySchemaNameTemplate : valueSchemaNameTemplate, topic);
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    String subject = schemaSubject(topic, type);
    SchemaMetadata meta = getSchemaBySubject(subject)
        .orElseThrow(() -> new ValidationException(
            String.format("No schema for subject '%s' found", subject)));
    ParsedSchema schema = getSchemaById(meta.getId())
        .orElseThrow(() -> new IllegalStateException(
            String.format("Schema found for id %s, subject '%s'", meta.getId(), subject)));
    SchemaType schemaType = SchemaType.fromString(meta.getSchemaType())
        .orElseThrow(() -> new IllegalStateException("Unknown schema type: " + meta.getSchemaType()));
    return switch (schemaType) {
      case PROTOBUF -> input ->
          serializeProto(schemaRegistryClient, topic, type, (ProtobufSchema) schema, meta.getId(), input);
      case AVRO -> input ->
          serializeAvro((AvroSchema) schema, meta.getId(), input);
      case JSON -> input ->
          serializeJson((JsonSchema) schema, meta.getId(), input);
    };
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return (headers, data) -> {
      var schemaId = extractSchemaIdFromMsg(data);
      SchemaType format = getMessageFormatBySchemaId(schemaId);
      MessageFormatter formatter = schemaRegistryFormatters.get(format);
      return new DeserializeResult(
          formatter.format(topic, data),
          DeserializeResult.Type.JSON,
          Map.of(
              "schemaId", schemaId,
              "type", format.name()
          )
      );
    };
  }

  private SchemaType getMessageFormatBySchemaId(int schemaId) {
    return getSchemaById(schemaId)
        .map(ParsedSchema::schemaType)
        .flatMap(SchemaType::fromString)
        .orElseThrow(() -> new ValidationException(String.format("Schema for id '%d' not found ", schemaId)));
  }

  private int extractSchemaIdFromMsg(byte[] data) {
    ByteBuffer buffer = ByteBuffer.wrap(data);
    if (buffer.remaining() >= SR_PAYLOAD_PREFIX_LENGTH && buffer.get() == SR_PAYLOAD_MAGIC_BYTE) {
      return buffer.getInt();
    }
    throw new ValidationException(
        String.format(
            "Data doesn't contain magic byte and schema id prefix, so it can't be deserialized with %s serde",
            name())
    );
  }
}
