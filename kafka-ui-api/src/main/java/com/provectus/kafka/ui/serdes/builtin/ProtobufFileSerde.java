package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.protobuf.AnyProto;
import com.google.protobuf.ApiProto;
import com.google.protobuf.DescriptorProtos;
import com.google.protobuf.Descriptors;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DurationProto;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.EmptyProto;
import com.google.protobuf.FieldMaskProto;
import com.google.protobuf.SourceContextProto;
import com.google.protobuf.StructProto;
import com.google.protobuf.TimestampProto;
import com.google.protobuf.TypeProto;
import com.google.protobuf.WrappersProto;
import com.google.protobuf.util.JsonFormat;
import com.google.type.ColorProto;
import com.google.type.DateProto;
import com.google.type.DateTimeProto;
import com.google.type.DayOfWeekProto;
import com.google.type.ExprProto;
import com.google.type.FractionProto;
import com.google.type.IntervalProto;
import com.google.type.LatLngProto;
import com.google.type.MoneyProto;
import com.google.type.MonthProto;
import com.google.type.PhoneNumberProto;
import com.google.type.PostalAddressProto;
import com.google.type.QuaternionProto;
import com.google.type.TimeOfDayProto;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.RecordHeaders;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import com.provectus.kafka.ui.util.jsonschema.ProtobufSchemaConverter;
import com.squareup.wire.schema.ErrorCollector;
import com.squareup.wire.schema.Linker;
import com.squareup.wire.schema.Loader;
import com.squareup.wire.schema.Location;
import com.squareup.wire.schema.ProtoFile;
import com.squareup.wire.schema.internal.parser.ProtoFileElement;
import com.squareup.wire.schema.internal.parser.ProtoParser;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
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
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;

@Slf4j
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
    return Configuration.canBeAutoConfigured(kafkaClusterProperties);
  }

  @Override
  public void autoConfigure(PropertyResolver kafkaClusterProperties,
                            PropertyResolver globalProperties) {
    configure(Configuration.create(kafkaClusterProperties));
  }

  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    configure(Configuration.create(serdeProperties));
  }

  @VisibleForTesting
  void configure(Configuration configuration) {
    if (configuration.defaultMessageDescriptor() == null
        && configuration.defaultKeyMessageDescriptor() == null
        && configuration.messageDescriptorMap().isEmpty()
        && configuration.keyMessageDescriptorMap().isEmpty()) {
      throw new ValidationException("Neither default, not per-topic descriptors defined for " + name() + " serde");
    }
    this.defaultMessageDescriptor = configuration.defaultMessageDescriptor();
    this.defaultKeyMessageDescriptor = configuration.defaultKeyMessageDescriptor();
    this.descriptorPaths = configuration.descriptorPaths();
    this.messageDescriptorMap = configuration.messageDescriptorMap();
    this.keyMessageDescriptorMap = configuration.keyMessageDescriptorMap();
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

  @SneakyThrows
  private static String readFileAsString(Path path) {
    return Files.readString(path);
  }

  //----------------------------------------------------------------------------------------------------------------

  @VisibleForTesting
  record Configuration(@Nullable Descriptor defaultMessageDescriptor,
                       @Nullable Descriptor defaultKeyMessageDescriptor,
                       Map<Descriptor, Path> descriptorPaths,
                       Map<String, Descriptor> messageDescriptorMap,
                       Map<String, Descriptor> keyMessageDescriptorMap) {

    static boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties) {
      Optional<List<String>> protobufFiles = kafkaClusterProperties.getListProperty("protobufFiles", String.class);
      Optional<String> protobufFilesDir = kafkaClusterProperties.getProperty("protobufFilesDir", String.class);
      return protobufFilesDir.isPresent() || protobufFiles.filter(files -> !files.isEmpty()).isPresent();
    }

    static Configuration create(PropertyResolver properties) {
      var protobufSchemas = loadSchemas(
          properties.getListProperty("protobufFiles", String.class),
          properties.getProperty("protobufFilesDir", String.class)
      );

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

      return new Configuration(
          protobufMessageName.map(descriptorMap::get).orElse(null),
          protobufMessageNameForKey.map(descriptorMap::get).orElse(null),
          descriptorPaths,
          protobufMessageNameByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of()),
          protobufMessageNameForKeyByTopic.map(map -> populateDescriptors(descriptorMap, map)).orElse(Map.of())
      );
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

    private static Map<String, Descriptor> populateDescriptors(Map<String, Descriptor> descriptorMap,
                                                               Map<String, String> messageNameMap) {
      Map<String, Descriptor> descriptors = new HashMap<>();
      for (Map.Entry<String, String> entry : messageNameMap.entrySet()) {
        descriptors.put(entry.getKey(), descriptorMap.get(entry.getValue()));
      }
      return descriptors;
    }

    @VisibleForTesting
    static Map<Path, ProtobufSchema> loadSchemas(Optional<List<String>> protobufFiles,
                                                 Optional<String> protobufFilesDir) {
      if (protobufFilesDir.isPresent()) {
        if (protobufFiles.isPresent()) {
          log.warn("protobufFiles properties will be ignored, since protobufFilesDir provided");
        }
        List<ProtoFile> loadedFiles = new ProtoSchemaLoader(protobufFilesDir.get()).load();
        Map<String, ProtoFileElement> allPaths = loadedFiles.stream()
            .collect(Collectors.toMap(f -> f.getLocation().getPath(), ProtoFile::toElement));
        return loadedFiles.stream()
            .collect(Collectors.toMap(
                f -> Path.of(f.getLocation().getBase(), f.getLocation().getPath()),
                f -> new ProtobufSchema(f.toElement(), List.of(), allPaths)));
      }
      //Supporting for backward-compatibility. Normally, protobufFilesDir setting should be used
      return protobufFiles.stream()
          .flatMap(Collection::stream)
          .distinct()
          .map(Path::of)
          .collect(Collectors.toMap(path -> path, path -> new ProtobufSchema(readFileAsString(path))));
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
  }

  static class ProtoSchemaLoader {

    private final Path baseLocation;

    ProtoSchemaLoader(String baseLocationStr) {
      this.baseLocation = Path.of(baseLocationStr);
      if (!Files.isReadable(baseLocation)) {
        throw new ValidationException("proto files directory not readable");
      }
    }

    List<ProtoFile> load() {
      Map<String, ProtoFile> knownTypes = knownProtoFiles();

      Map<String, ProtoFile> filesByLocations = new HashMap<>();
      filesByLocations.putAll(knownTypes);
      filesByLocations.putAll(loadFilesWithLocations());

      Linker linker = new Linker(
          createFilesLoader(filesByLocations),
          new ErrorCollector(),
          true,
          true
      );
      var schema = linker.link(filesByLocations.values());
      linker.getErrors().throwIfNonEmpty();
      return schema.getProtoFiles()
          .stream()
          .filter(p -> !knownTypes.containsKey(p.getLocation().getPath())) //filtering known types
          .toList();
    }

    private Map<String, ProtoFile> knownProtoFiles() {
      return Stream.of(
          loadKnownProtoFile("google/type/color.proto", ColorProto.getDescriptor()),
          loadKnownProtoFile("google/type/date.proto", DateProto.getDescriptor()),
          loadKnownProtoFile("google/type/datetime.proto", DateTimeProto.getDescriptor()),
          loadKnownProtoFile("google/type/dayofweek.proto", DayOfWeekProto.getDescriptor()),
          loadKnownProtoFile("google/type/decimal.proto", com.google.type.DecimalProto.getDescriptor()),
          loadKnownProtoFile("google/type/expr.proto", ExprProto.getDescriptor()),
          loadKnownProtoFile("google/type/fraction.proto", FractionProto.getDescriptor()),
          loadKnownProtoFile("google/type/interval.proto", IntervalProto.getDescriptor()),
          loadKnownProtoFile("google/type/latlng.proto", LatLngProto.getDescriptor()),
          loadKnownProtoFile("google/type/money.proto", MoneyProto.getDescriptor()),
          loadKnownProtoFile("google/type/month.proto", MonthProto.getDescriptor()),
          loadKnownProtoFile("google/type/phone_number.proto", PhoneNumberProto.getDescriptor()),
          loadKnownProtoFile("google/type/postal_address.proto", PostalAddressProto.getDescriptor()),
          loadKnownProtoFile("google/type/quaternion.prot", QuaternionProto.getDescriptor()),
          loadKnownProtoFile("google/type/timeofday.proto", TimeOfDayProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/any.proto", AnyProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/api.proto", ApiProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/descriptor.proto", DescriptorProtos.getDescriptor()),
          loadKnownProtoFile("google/protobuf/duration.proto", DurationProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/empty.proto", EmptyProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/field_mask.proto", FieldMaskProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/source_context.proto", SourceContextProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/struct.proto", StructProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/timestamp.proto", TimestampProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/type.proto", TypeProto.getDescriptor()),
          loadKnownProtoFile("google/protobuf/wrappers.proto", WrappersProto.getDescriptor())
      ).collect(Collectors.toMap(p -> p.getLocation().getPath(), p -> p));
    }

    private ProtoFile loadKnownProtoFile(String path, Descriptors.FileDescriptor fileDescriptor) {
      String protoFileString = null;
      // know type file contains either message or enum
      if (!fileDescriptor.getMessageTypes().isEmpty()) {
        protoFileString = new ProtobufSchema(fileDescriptor.getMessageTypes().get(0)).canonicalString();
      } else if (!fileDescriptor.getEnumTypes().isEmpty()) {
        protoFileString = new ProtobufSchema(fileDescriptor.getEnumTypes().get(0)).canonicalString();
      } else {
        throw new IllegalStateException();
      }
      return ProtoFile.Companion.get(ProtoParser.Companion.parse(Location.get(path), protoFileString));
    }

    private Loader createFilesLoader(Map<String, ProtoFile> files) {
      return new Loader() {
        @Override
        public @NotNull ProtoFile load(@NotNull String path) {
          return Preconditions.checkNotNull(files.get(path), "ProtoFile not found for import '%s'", path);
        }

        @Override
        public @NotNull Loader withErrors(@NotNull ErrorCollector errorCollector) {
          return this;
        }
      };
    }

    @SneakyThrows
    private Map<String, ProtoFile> loadFilesWithLocations() {
      Map<String, ProtoFile> filesByLocations = new HashMap<>();
      try (var files = Files.walk(baseLocation)) {
        files.filter(p -> !Files.isDirectory(p) && p.toString().endsWith(".proto"))
            .forEach(path -> {
              // relative path will be used as "import" statement
              String relativePath = baseLocation.relativize(path).toString();
              var protoFileElement = ProtoParser.Companion.parse(
                  Location.get(baseLocation.toString(), relativePath),
                  readFileAsString(path)
              );
              filesByLocations.put(relativePath, ProtoFile.Companion.get(protoFileElement));
            });
      }
      return filesByLocations;
    }
  }

}
