package com.provectus.kafka.ui.serdes.builtin.sr;

import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.BASIC_AUTH_CREDENTIALS_SOURCE;
import static io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig.USER_INFO_CONFIG;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
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
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.common.config.SslConfigs;


public class SchemaRegistrySerde implements BuiltInSerde {

  public static String name() {
    return "SchemaRegistry";
  }

  private SchemaRegistryClient schemaRegistryClient;
  private List<String> schemaRegistryUrls;
  private String valueSchemaNameTemplate;
  private String keySchemaNameTemplate;

  private Map<SchemaType, MessageFormatter> schemaRegistryFormatters;

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
                .orElse(null),

            serdeProperties.getProperty("keystoreLocation", String.class)
                    .or(() -> kafkaClusterProperties.getProperty("schemaRegistrySSL.keystoreLocation", String.class))
                    .orElse(null),
            serdeProperties.getProperty("keystorePassword", String.class)
                    .or(() -> kafkaClusterProperties.getProperty("schemaRegistrySSL.keystorePassword", String.class))
                    .orElse(null),
            serdeProperties.getProperty("truststoreLocation", String.class)
                    .or(() -> kafkaClusterProperties.getProperty("schemaRegistrySSL.truststoreLocation", String.class))
                    .orElse(null),
            serdeProperties.getProperty("truststorePassword", String.class)
                    .or(() -> kafkaClusterProperties.getProperty("schemaRegistrySSL.truststorePassword", String.class))
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
    this.schemaRegistryFormatters = MessageFormatter.createMap(schemaRegistryClient);
  }

  private static SchemaRegistryClient createSchemaRegistryClient(List<String> urls,
                                                                 @Nullable String username,
                                                                 @Nullable String password,
                                                                 @Nullable String keyStoreLocation,
                                                                 @Nullable String keyStorePassword,
                                                                 @Nullable String trustStoreLocation,
                                                                 @Nullable String trustStorePassword
                                                                 ) {
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

      if (keyStoreLocation != null) {
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG,
            keyStoreLocation);
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG,
            keyStorePassword);
        configs.put(SchemaRegistryClientConfig.CLIENT_NAMESPACE + SslConfigs.SSL_KEY_PASSWORD_CONFIG,
            keyStorePassword);
      }
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
    return getSchemaBySubject(subject).isPresent();
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
        .map(schemaMetadata ->
            new SchemaDescription(
                convertSchema(schemaMetadata),
                Map.of(
                    "subject", subject,
                    "schemaId", schemaMetadata.getId(),
                    "latestVersion", schemaMetadata.getVersion(),
                    "type", schemaMetadata.getSchemaType() // AVRO / PROTOBUF / JSON
                )
            ));
  }

  @SneakyThrows
  private String convertSchema(SchemaMetadata schema) {
    URI basePath = new URI(schemaRegistryUrls.get(0))
        .resolve(Integer.toString(schema.getId()));
    ParsedSchema schemaById = schemaRegistryClient.getSchemaById(schema.getId());
    SchemaType schemaType = SchemaType.fromString(schema.getSchemaType())
        .orElseThrow(() -> new IllegalStateException("Unknown schema type: " + schema.getSchemaType()));
    switch (schemaType) {
      case PROTOBUF:
        return new ProtobufSchemaConverter()
            .convert(basePath, ((ProtobufSchema) schemaById).toDescriptor())
            .toJson();
      case AVRO:
        return new AvroJsonSchemaConverter()
            .convert(basePath, ((AvroSchema) schemaById).rawSchema())
            .toJson();
      case JSON:
        return schema.getSchema();
      default:
        throw new IllegalStateException();
    }
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
    var schema = getSchemaBySubject(subject)
        .orElseThrow(() -> new ValidationException(String.format("No schema for subject '%s' found", subject)));
    boolean isKey = type == Target.KEY;
    SchemaType schemaType = SchemaType.fromString(schema.getSchemaType())
        .orElseThrow(() -> new IllegalStateException("Unknown schema type: " + schema.getSchemaType()));
    switch (schemaType) {
      case PROTOBUF:
        return new ProtobufSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
      case AVRO:
        return new AvroSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
      case JSON:
        return new JsonSchemaSchemaRegistrySerializer(topic, isKey, schemaRegistryClient, schema);
      default:
        throw new IllegalStateException();
    }
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return new SrDeserializer(topic);
  }

  ///--------------------------------------------------------------

  private static final byte SR_RECORD_MAGIC_BYTE = (byte) 0;
  private static final int SR_RECORD_PREFIX_LENGTH = 5;

  @RequiredArgsConstructor
  private class SrDeserializer implements Deserializer {

    private final String topic;

    @Override
    public DeserializeResult deserialize(RecordHeaders headers, byte[] data) {
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
    }
  }

  private SchemaType getMessageFormatBySchemaId(int schemaId) {
    return wrapWith404Handler(() -> schemaRegistryClient.getSchemaById(schemaId))
        .map(ParsedSchema::schemaType)
        .flatMap(SchemaType::fromString)
        .orElseThrow(() -> new ValidationException(String.format("Schema for id '%d' not found ", schemaId)));
  }

  private int extractSchemaIdFromMsg(byte[] data) {
    ByteBuffer buffer = ByteBuffer.wrap(data);
    if (buffer.remaining() > SR_RECORD_PREFIX_LENGTH && buffer.get() == SR_RECORD_MAGIC_BYTE) {
      return buffer.getInt();
    }
    throw new ValidationException(
        String.format(
            "Data doesn't contain magic byte and schema id prefix, so it can't be deserialized with %s serde",
            name())
    );
  }
}
