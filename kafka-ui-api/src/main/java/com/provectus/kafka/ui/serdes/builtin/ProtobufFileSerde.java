package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.annotations.VisibleForTesting;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import com.squareup.wire.schema.Location;
import com.squareup.wire.schema.ProtoFile;
import com.squareup.wire.schema.Schema;
import com.squareup.wire.schema.SchemaLoader;
import com.squareup.wire.schema.internal.parser.ProtoFileElement;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

  @Nullable
  private Descriptor defaultMessageDescriptor;

  @Nullable
  private Descriptor defaultKeyMessageDescriptor;

  @Override
  public boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties,
                                     PropertyResolver globalProperties) {
    Optional<String> protobufFile = kafkaClusterProperties.getProperty("protobufFile", String.class);
    Optional<List<String>> protobufFiles = kafkaClusterProperties.getListProperty("protobufFiles", String.class);
    return protobufFile.isPresent() || protobufFiles.filter(files -> !files.isEmpty()).isPresent();
  }

  @Override
  public void autoConfigure(PropertyResolver kafkaClusterProperties,
                            PropertyResolver globalProperties) {
    configure(kafkaClusterProperties);
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    configure(serdeProperties);
  }

  private void configure(PropertyResolver properties) {
    List<Location> locations = joinPathProperties(properties).stream()
        .map(ProtobufFileSerde::toLocation)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    SchemaLoader schemaLoader = new SchemaLoader(FileSystems.getDefault());
    schemaLoader.setLoadExhaustively(true);
    schemaLoader.setPermitPackageCycles(true);
    schemaLoader.initRoots(locations, List.of());

    final Schema schema;
    try {
      schema = schemaLoader.loadSchema();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    Map<String, ProtoFileElement> dependencies = schema.getProtoFiles().stream()
        .collect(Collectors.toMap(ProtoFile::toString, ProtoFile::toElement));

    Map<Path, ProtobufSchema> protobufSchemas = schema.getProtoFiles().stream()
        .map(protoFile -> {
          Location location = protoFile.getLocation();
          ProtobufSchema protobufSchema = new ProtobufSchema(protoFile.toElement(), List.of(), dependencies);
          return Map.entry(Paths.get(location.getBase(), location.getPath()), protobufSchema);
        }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    // Load all referenced message schemas and store their source proto file with the descriptors
    Map<Descriptor, Path> descriptorPaths = new HashMap<>();
    Optional<String> protobufMessageName = properties.getProperty("protobufMessageName", String.class);
    protobufMessageName.ifPresent(messageName -> addProtobufSchema(descriptorPaths, protobufSchemas, messageName));

    Optional<String> protobufMessageNameForKey =
        properties.getProperty("protobufMessageNameForKey", String.class);
    protobufMessageNameForKey
        .ifPresent(messageName -> addProtobufSchema(descriptorPaths, protobufSchemas, messageName));

    Optional<Map<String, String>> protobufMessageNameByTopic =
        properties.getMapProperty("protobufMessageNameByTopic", String.class, String.class);
    protobufMessageNameByTopic
        .ifPresent(messageNamesByTopic -> addProtobufSchemas(descriptorPaths, protobufSchemas, messageNamesByTopic));

    Optional<Map<String, String>> protobufMessageNameForKeyByTopic =
        properties.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class);
    protobufMessageNameForKeyByTopic
        .ifPresent(messageNamesByTopic -> addProtobufSchemas(descriptorPaths, protobufSchemas, messageNamesByTopic));

    // Fill dictionary for descriptor lookup by full message name
    Map<String, Descriptor> descriptorMap = descriptorPaths.keySet().stream()
        .collect(Collectors.toMap(Descriptor::getFullName, Function.identity()));

    configure(
        protobufMessageName.map(descriptorMap::get).orElse(null),
        protobufMessageNameForKey.map(descriptorMap::get).orElse(null),
        descriptorPaths,
        protobufMessageNameByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of()),
        protobufMessageNameForKeyByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of())
    );
  }

  @VisibleForTesting
  void configure(
      @Nullable Descriptor defaultMessageDescriptor,
      @Nullable Descriptor defaultKeyMessageDescriptor,
      Map<Descriptor, Path> descriptorPaths,
      Map<String, Descriptor> messageDescriptorMap,
      Map<String, Descriptor> keyMessageDescriptorMap) {
    if (defaultMessageDescriptor == null
        && defaultKeyMessageDescriptor == null
        && messageDescriptorMap.isEmpty()
        && keyMessageDescriptorMap.isEmpty()) {
      throw new ValidationException("Neither default, not per-topic descriptors defined for " + name() + " serde");
    }
    this.defaultMessageDescriptor = defaultMessageDescriptor;
    this.defaultKeyMessageDescriptor = defaultKeyMessageDescriptor;
    this.descriptorPaths = descriptorPaths;
    this.messageDescriptorMap = messageDescriptorMap;
    this.keyMessageDescriptorMap = keyMessageDescriptorMap;
  }

  @Nullable
  private static Location toLocation(Path path) {
    if (Files.isDirectory(path)) {
      return Location.get(path.toString());
    }
    if (Files.isRegularFile(path)) {
      return Location.get(path.getParent().toString(), path.getFileName().toString());
    }
    return null;
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
            .filter(schema -> schema.getValue().toDescriptor(msgName) != null)
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
