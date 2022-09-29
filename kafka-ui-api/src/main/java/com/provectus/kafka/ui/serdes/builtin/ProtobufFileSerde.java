package com.provectus.kafka.ui.serdes.builtin;

import com.google.common.annotations.VisibleForTesting;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.DynamicMessage;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.SneakyThrows;


public class ProtobufFileSerde implements BuiltInSerde {

  public static String name() {
    return "ProtobufFile";
  }

  private static final ProtobufSchemaConverter SCHEMA_CONVERTER = new ProtobufSchemaConverter();

  private Path protobufSchemaPath;

  private Map<String, Descriptor> messageDescriptorMap = new HashMap<>();
  private Map<String, Descriptor> keyMessageDescriptorMap = new HashMap<>();

  private Descriptor defaultMessageDescriptor;

  @Nullable
  private Descriptor defaultKeyMessageDescriptor;

  @Override
  public boolean initOnStartup(PropertyResolver kafkaClusterProperties,
                               PropertyResolver globalProperties) {
    return kafkaClusterProperties.getProperty("protobufFile", String.class)
        .isPresent();
  }

  @SneakyThrows
  @Override
  public void configure(PropertyResolver serdeProperties,
                        PropertyResolver kafkaClusterProperties,
                        PropertyResolver globalProperties) {
    protobufSchemaPath = Path.of(
        kafkaClusterProperties.getProperty("protobufFile", String.class)
            .orElseThrow());
    ProtobufSchema protobufSchema;
    try (Stream<String> lines = Files.lines(protobufSchemaPath)) {
      protobufSchema = new ProtobufSchema(lines.collect(Collectors.joining("\n")));
    }
    configure(
        protobufSchemaPath,
        defaultMessageDescriptor = kafkaClusterProperties.getProperty("protobufMessageName", String.class)
            .map(msgName -> Objects.requireNonNull(protobufSchema.toDescriptor(msgName),
                "The given message type not found in protobuf definition: " + msgName))
            // this is strange logic, but we need it to support serde's backward-compatibility
            .orElseGet(protobufSchema::toDescriptor),
        defaultKeyMessageDescriptor = kafkaClusterProperties.getProperty("protobufMessageNameForKey", String.class)
            .map(msgName -> Objects.requireNonNull(protobufSchema.toDescriptor(msgName),
                "The given message type not found in protobuf definition: " + msgName))
            .orElse(null),
        kafkaClusterProperties.getMapProperty("protobufMessageNameByTopic", String.class, String.class)
            .map(map -> populateDescriptors(protobufSchema, map))
            .orElse(Map.of()),
        kafkaClusterProperties.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class)
            .map(map -> populateDescriptors(protobufSchema, map))
            .orElse(Map.of())
    );
  }

  @VisibleForTesting
  void configure(
      Path protobufSchemaPath,
      Descriptor defaultMessageDescriptor,
      @Nullable Descriptor defaultKeyMessageDescriptor,
      Map<String, Descriptor> messageDescriptorMap,
      Map<String, Descriptor> keyMessageDescriptorMap) {
    this.protobufSchemaPath = protobufSchemaPath;
    this.defaultMessageDescriptor = defaultMessageDescriptor;
    this.defaultKeyMessageDescriptor = defaultKeyMessageDescriptor;
    this.messageDescriptorMap = messageDescriptorMap;
    this.keyMessageDescriptorMap = keyMessageDescriptorMap;
  }

  private Map<String, Descriptor> populateDescriptors(ProtobufSchema protobufSchema,
                                                      Map<String, String> messageNameMap) {
    Map<String, Descriptor> descriptors = new HashMap<>();
    for (Map.Entry<String, String> entry : messageNameMap.entrySet()) {
      var descriptor = Objects.requireNonNull(protobufSchema.toDescriptor(entry.getValue()),
          "The given message type is not found in protobuf definition: "
              + entry.getValue());
      descriptors.put(entry.getKey(), descriptor);
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
    return descriptorFor(topic, type)
        .map(descriptor ->
            new SchemaDescription(
                SCHEMA_CONVERTER.convert(protobufSchemaPath.toUri(), descriptor).toJson(),
                Map.of("messageName", descriptor.getFullName())
            ));
  }
}
