package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.annotations.VisibleForTesting;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Empty;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.SneakyThrows;

public class ProtobufFileSerde implements BuiltInSerde {

  public static String name() {
    return "ProtobufFile";
  }

  private static final ProtobufSchemaConverter SCHEMA_CONVERTER = new ProtobufSchemaConverter();

  private Map<String, Descriptor> messageDescriptorMap = new HashMap<>();
  private Map<String, Descriptor> keyMessageDescriptorMap = new HashMap<>();

  private Map<Descriptor, Path> descriptorPaths = new HashMap<>();

  private Descriptor defaultMessageDescriptor;

  @Nullable
  private Descriptor defaultKeyMessageDescriptor;

  @Override
  public boolean initOnStartup(PropertyResolver kafkaClusterProperties,
                               PropertyResolver globalProperties) {
    Optional<String> protobufFile = kafkaClusterProperties.getProperty("protobufFile", String.class);
    Optional<List<String>> protobufFiles = kafkaClusterProperties.getListProperty("protobufFiles", String.class);

    return protobufFile.isPresent() || protobufFiles.map(files -> files.isEmpty() ? null : files).isPresent();
  }

  @SneakyThrows
  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    Map<Path, ProtobufSchema> protobufSchemas = joinPathProperties(kafkaClusterProperties).stream()
        .map(path -> Map.entry(path, new ProtobufSchema(readFileAsString(path))))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));


    // Load all referenced message schemas and store their source proto file with the descriptors
    Map<Descriptor, Path> descriptorPaths = new HashMap<>();
    Optional<String> protobufMessageName = kafkaClusterProperties.getProperty("protobufMessageName", String.class);
    protobufMessageName.ifPresent(messageName -> addProtobufSchema(descriptorPaths, protobufSchemas, messageName));

    Optional<String> protobufMessageNameForKey =
        kafkaClusterProperties.getProperty("protobufMessageNameForKey", String.class);
    protobufMessageNameForKey
        .ifPresent(messageName -> addProtobufSchema(descriptorPaths, protobufSchemas, messageName));

    Optional<Map<String, String>> protobufMessageNameByTopic =
        kafkaClusterProperties.getMapProperty("protobufMessageNameByTopic", String.class, String.class);
    protobufMessageNameByTopic
        .ifPresent(messageNamesByTopic -> addProtobufSchemas(descriptorPaths, protobufSchemas, messageNamesByTopic));

    Optional<Map<String, String>> protobufMessageNameForKeyByTopic =
        kafkaClusterProperties.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class);
    protobufMessageNameForKeyByTopic
        .ifPresent(messageNamesByTopic -> addProtobufSchemas(descriptorPaths, protobufSchemas, messageNamesByTopic));

    // Fill dictionary for descriptor lookup by full message name
    Map<String, Descriptor> descriptorMap = descriptorPaths.keySet().stream()
        .collect(Collectors.toMap(Descriptor::getFullName, Function.identity()));

    configure(
        // this is strange logic, but we need it to support serde's backward-compatibility
        protobufMessageName.map(descriptorMap::get).orElseGet(Empty::getDescriptor),
        protobufMessageNameForKey.map(descriptorMap::get).orElse(null),
        descriptorPaths,
        protobufMessageNameByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of()),
        protobufMessageNameForKeyByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of())
    );
  }

  @VisibleForTesting
  void configure(
      Descriptor defaultMessageDescriptor,
      @Nullable Descriptor defaultKeyMessageDescriptor,
      Map<Descriptor, Path> descriptorPaths,
      Map<String, Descriptor> messageDescriptorMap,
      Map<String, Descriptor> keyMessageDescriptorMap) {
    this.defaultMessageDescriptor = defaultMessageDescriptor;
    this.defaultKeyMessageDescriptor = defaultKeyMessageDescriptor;
    this.descriptorPaths = descriptorPaths;
    this.messageDescriptorMap = messageDescriptorMap;
    this.keyMessageDescriptorMap = keyMessageDescriptorMap;
  }

  private static void addProtobufSchema(Map<Descriptor, Path> descriptorPaths,
                                 Map<Path, ProtobufSchema> protobufSchemas,
                                 String messageName) {
    var descriptorAndPath = getDescriptorAndPath(protobufSchemas, messageName);
    descriptorPaths.put(descriptorAndPath.getKey(), descriptorAndPath.getValue());
  }

  private static void addProtobufSchemas(Map<Descriptor, Path> descriptorPaths,
                                  Map<Path, ProtobufSchema> protobufSchemas,
                                  Map<String, String> messageNamesByTopic) {
    messageNamesByTopic.values().stream()
        .map(msgName -> getDescriptorAndPath(protobufSchemas, msgName))
        .forEach(entry -> descriptorPaths.put(entry.getKey(), entry.getValue()));
  }

  private static List<Path> joinPathProperties(PropertyResolver propertyResolver) {
    return Stream.concat(
            propertyResolver.getProperty("protobufFile", String.class).map(List::of).stream(),
            propertyResolver.getListProperty("protobufFiles", String.class).stream())
        .flatMap(Collection::stream)
        .distinct()
        .map(Path::of)
        .collect(Collectors.toList());
  }

  private static Map.Entry<Descriptor, Path> getDescriptorAndPath(Map<Path, ProtobufSchema> protobufSchemas,
                                                                  String msgName) {
    return protobufSchemas.entrySet().stream()
            .filter(schema -> schema.getValue() != null && schema.getValue().toDescriptor(msgName) != null)
            .map(schema -> Map.entry(schema.getValue().toDescriptor(msgName), schema.getKey()))
            .findFirst()
            .orElseThrow(() -> new NullPointerException(
                    "The given message type not found in protobuf definition: " + msgName));
  }

  private static String readFileAsString(Path path) {
    try {
      return Files.readString(path);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private Map<String, Descriptor> populateDescriptors(Map<String, Descriptor> descriptorMap,
                                                      Map<String, String> messageNameMap) {
    Map<String, Descriptor> descriptors = new HashMap<>();
    for (Map.Entry<String, String> entry : messageNameMap.entrySet()) {
      descriptors.put(entry.getKey(), descriptorMap.get(entry.getValue()));
    }
    return descriptors;
  }

  @Override
  public Optional<String> getDescription() {
    return Optional.empty();
  }

  private Optional<Descriptor> descriptorFor(String topic, Target type) {
    return type == Target.KEY
        ?
        Optional.ofNullable(keyMessageDescriptorMap.get(topic))
            .or(() -> Optional.ofNullable(defaultKeyMessageDescriptor))
        :
        Optional.ofNullable(messageDescriptorMap.get(topic))
            .or(() -> Optional.ofNullable(defaultMessageDescriptor));
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    return descriptorFor(topic, type).isPresent();
  }

  @Override
  public boolean canSerialize(String topic, Target type) {
    return descriptorFor(topic, type).isPresent();
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    var descriptor = descriptorFor(topic, type).orElseThrow();
    return new Serializer() {
      @SneakyThrows
      @Override
      public byte[] serialize(String input) {
        DynamicMessage.Builder builder = DynamicMessage.newBuilder(descriptor);
        JsonFormat.parser().merge(input, builder);
        return builder.build().toByteArray();
      }
    };
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    var descriptor = descriptorFor(topic, type).orElseThrow();
    return new Deserializer() {
      @SneakyThrows
      @Override
      public DeserializeResult deserialize(RecordHeaders headers, byte[] data) {
        var protoMsg = DynamicMessage.parseFrom(descriptor, new ByteArrayInputStream(data));
        byte[] jsonFromProto = ProtobufSchemaUtils.toJson(protoMsg);
        var result = new String(jsonFromProto);
        return new DeserializeResult(
            result,
            DeserializeResult.Type.JSON,
            Map.of()
        );
      }
    };
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Target type) {
    return descriptorFor(topic, type).map(this::toSchemaDescription);
  }

  private SchemaDescription toSchemaDescription(Descriptor descriptor) {
    Path path = descriptorPaths.get(descriptor);
    return new SchemaDescription(
        SCHEMA_CONVERTER.convert(path.toUri(), descriptor).toJson(),
        Map.of("messageName", descriptor.getFullName())
    );
  }
}
