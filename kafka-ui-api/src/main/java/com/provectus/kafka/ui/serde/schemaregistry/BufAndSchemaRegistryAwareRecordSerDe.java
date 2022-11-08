package com.provectus.kafka.ui.serde.schemaregistry;

import com.google.common.annotations.VisibleForTesting;
import com.google.protobuf.Any;
import com.google.protobuf.Descriptors.Descriptor;
import com.google.protobuf.Descriptors.FileDescriptor;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.client.BufSchemaRegistryClient;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.ProtoSchema;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import javax.annotation.Nullable;
import lombok.Data;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class BufAndSchemaRegistryAwareRecordSerDe implements RecordSerDe {

  @Data
  private class CachedDescriptor {
    final Date timeCached;
    final Optional<Descriptor> descriptor;
  }

  @Data
  private class CachedTypeRegistry {
    final Date timeCached;
    final Optional<JsonFormat.TypeRegistry> typeRegistry;
  }

  @Data
  private class BufRepoInfo {
    final String owner;
    final String repo;
    final String reference;
  }

  private final SchemaRegistryAwareRecordSerDe schemaRegistryAwareRecordSerDe;
  private final BufSchemaRegistryClient bufClient;

  private final String bufRegistryUrl;
  private final String bufDefaultOwner;
  private final String bufDefaultRepo;
  private final Map<String, String> bufOwnerRepoByProtobufMessageName;
  private final Map<String, String> protobufMessageNameByTopic;
  private final Map<String, String> protobufKeyMessageNameByTopic;

  private final Map<String, CachedDescriptor> cachedMessageDescriptorMap;
  private final Map<String, CachedTypeRegistry> cachedTypeRegistryMap;
  private final int cachedMessageDescriptorRetentionSeconds;

  private final String googleProtobufAnyType = "google.protobuf.Any";

  public BufAndSchemaRegistryAwareRecordSerDe(KafkaCluster cluster) {
    this(cluster, null, createBufRegistryClient(cluster));
  }

  public BufAndSchemaRegistryAwareRecordSerDe(
      KafkaCluster cluster,
      SchemaRegistryClient schemaRegistryClient,
      BufSchemaRegistryClient bufClient) {
    if (schemaRegistryClient == null) {
      this.schemaRegistryAwareRecordSerDe = new SchemaRegistryAwareRecordSerDe(cluster);
    } else {
      // Used for testing.
      this.schemaRegistryAwareRecordSerDe = new SchemaRegistryAwareRecordSerDe(cluster, schemaRegistryClient);
    }

    this.bufClient = bufClient;

    if (cluster.getBufRegistryCacheDurationSeconds() != null) {
      int cacheSeconds = cluster.getBufRegistryCacheDurationSeconds();
      if (cacheSeconds == 0) {
        log.warn("Buf registry cache duration seconds must be greater than 0, setting to 300");
        this.cachedMessageDescriptorRetentionSeconds = 300;
      } else {
        this.cachedMessageDescriptorRetentionSeconds = cacheSeconds;
      }
    } else {
      this.cachedMessageDescriptorRetentionSeconds = 300;
    }
    if (cluster.getBufDefaultOwner() != null) {
      this.bufDefaultOwner = cluster.getBufDefaultOwner();
    } else {
      this.bufDefaultOwner = "";
    }
    if (cluster.getBufDefaultRepo() != null) {
      this.bufDefaultRepo = cluster.getBufDefaultRepo();
    } else {
      this.bufDefaultRepo = "";
    }
    if (cluster.getBufOwnerRepoByProtobufMessageName() != null) {
      this.bufOwnerRepoByProtobufMessageName = cluster.getBufOwnerRepoByProtobufMessageName();
    } else {
      this.bufOwnerRepoByProtobufMessageName = new HashMap<>();
    }
    if (cluster.getProtobufMessageNameByTopic() != null) {
      this.protobufMessageNameByTopic = cluster.getProtobufMessageNameByTopic();
    } else {
      this.protobufMessageNameByTopic = new HashMap<>();
    }
    if (cluster.getProtobufKeyMessageNameByTopic() != null) {
      this.protobufKeyMessageNameByTopic = cluster.getProtobufKeyMessageNameByTopic();
    } else {
      this.protobufKeyMessageNameByTopic = new HashMap<>();
    }

    this.bufRegistryUrl = cluster.getBufRegistry();

    this.cachedMessageDescriptorMap = new HashMap<>();
    this.cachedTypeRegistryMap = new HashMap<>();

    log.info("Will cache descriptors from buf for {} seconds", this.cachedMessageDescriptorRetentionSeconds);
  }

  private static BufSchemaRegistryClient createBufRegistryClient(KafkaCluster cluster) {
    return new BufSchemaRegistryClient(cluster.getBufRegistry(),
        cluster.getBufPort(),
        cluster.getBufApiToken());
  }

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    String keyType = null;
    String keySchemaInfo = null;
    String valueType = null;
    String valueSchemaInfo = null;

    Optional<ProtoSchema> protoSchemaFromTopic = protoSchemaFromTopic(msg.topic());

    if (protoSchemaFromTopic.isPresent()) {
      keyType = protoSchemaFromTopic.get().getFullyQualifiedTypeName();
      valueType = protoSchemaFromTopic.get().getFullyQualifiedTypeName();
    }

    Optional<ProtoSchema> protoSchemaForKeyFromHeader = protoKeySchemaFromHeaders(msg.headers());
    if (protoSchemaForKeyFromHeader.isPresent()) {
      keyType = protoSchemaForKeyFromHeader.get().getFullyQualifiedTypeName();
      keySchemaInfo = protoSchemaForKeyFromHeader.get().getSchemaID();
    }

    Optional<ProtoSchema> protoSchemaForValueFromHeader = protoValueSchemaFromHeaders(msg.headers());
    if (protoSchemaForValueFromHeader.isPresent()) {
      valueType = protoSchemaForValueFromHeader.get().getFullyQualifiedTypeName();
      valueSchemaInfo = protoSchemaForValueFromHeader.get().getSchemaID();
    }

    String keyTypeFromConfig = protobufKeyMessageNameByTopic.get(msg.topic());
    if (keyTypeFromConfig != null) {
      keyType = keyTypeFromConfig;
    }

    String valueTypeFromConfig = protobufMessageNameByTopic.get(msg.topic());
    if (valueTypeFromConfig != null) {
      valueType = valueTypeFromConfig;
    }

    if (keyType != null || valueType != null) {
      return deserializeProto(msg, keyType, keySchemaInfo, valueType, valueSchemaInfo);
    }

    log.debug("No proto schema found, skipping buf for topic {}", msg.topic());

    return this.schemaRegistryAwareRecordSerDe.deserialize(msg);
  }

  private DeserializedKeyValue deserializeProto(ConsumerRecord<Bytes, Bytes> msg,
      String keyFullyQualifiedType,
      String keySchemaInfo,
      String valueFullyQualifiedType,
      String valueSchemaInfo) {
    Optional<Descriptor> keyDescriptor = Optional.empty();
    if (keyFullyQualifiedType != null) {
      keyDescriptor = getDescriptor(keyFullyQualifiedType, keySchemaInfo);
      if (!keyDescriptor.isPresent()) {
        log.warn("No key descriptor found for topic {} with schema {}, {}", msg.topic(), keyFullyQualifiedType,
            keySchemaInfo);
      }
    }

    Optional<Descriptor> valueDescriptor = Optional.empty();
    if (valueFullyQualifiedType != null) {
      valueDescriptor = getDescriptor(valueFullyQualifiedType, valueSchemaInfo);
      if (!valueDescriptor.isPresent()) {
        log.warn("No value descriptor found for topic {} with schema {}, {}", msg.topic(), valueFullyQualifiedType,
            valueSchemaInfo);
      }
    }

    return this.deserializeProtobuf(msg, keyDescriptor, keySchemaInfo, valueDescriptor, valueSchemaInfo);
  }

  Optional<ProtoSchema> protoKeySchemaFromHeaders(Headers headers) {
    // Get protobuf.type.key header.
    String typeUrl = null;
    for (Header header : headers) {
      if (header.key().toLowerCase().equals("protobuf.type.key")) {
        typeUrl = new String(header.value(), StandardCharsets.UTF_8);
      }
    }

    if (typeUrl == null) {
      return Optional.empty();
    }

    return Optional.of(parseTypeHeader(typeUrl));
  }

  Optional<ProtoSchema> protoValueSchemaFromHeaders(Headers headers) {
    // Get protobuf.type.value header.
    String typeUrl = null;
    for (Header header : headers) {
      if (header.key().toLowerCase().equals("protobuf.type.value")) {
        typeUrl = new String(header.value(), StandardCharsets.UTF_8);
      }
    }

    if (typeUrl == null) {
      return Optional.empty();
    }

    return Optional.of(parseTypeHeader(typeUrl));
  }

  ProtoSchema parseTypeHeader(String typeUrl) {
    /*
     * Parse a type URL like buf.build/owner/repo:commit/type into the buf owner,
     * repo, and reference info and the fully qualified protobuf type.
     */

    String[] parts = typeUrl.split("/");
    if (parts.length != 4) {
      ProtoSchema ret = new ProtoSchema();
      ret.setFullyQualifiedTypeName(typeUrl);
      return ret;
    }

    if (!parts[0].equals(bufRegistryUrl)) {
      log.error("{} is not a supported Buf registry", parts[0]);

      ProtoSchema ret = new ProtoSchema();
      ret.setFullyQualifiedTypeName(parts[3]);
      return ret;
    }

    ProtoSchema ret = new ProtoSchema();
    ret.setFullyQualifiedTypeName(parts[3]);
    ret.setSchemaID(String.format("%s/%s", parts[1], parts[2]));
    return ret;
  }

  Optional<ProtoSchema> protoSchemaFromTopic(String topic) {
    if (!topic.contains(".proto.")) {
      return Optional.empty();
    }

    // Extract the fully qualified type name from the topic.
    // E.g., my-topic.proto.service.v1.User -> service.v1.User.
    String[] parts = topic.split("\\.proto\\.");
    ProtoSchema ret = new ProtoSchema();
    ret.setFullyQualifiedTypeName(parts[parts.length - 1]);
    return Optional.of(ret);
  }

  private DeserializedKeyValue deserializeProtobuf(ConsumerRecord<Bytes, Bytes> msg,
      Optional<Descriptor> keyDescriptor,
      String keySchemaInfo,
      Optional<Descriptor> valueDescriptor,
      String valueSchemaInfo) {
    var builder = DeserializedKeyValue.builder();
    if (msg.key() != null) {
      if (keyDescriptor.isPresent()) {
        builder.key(parse(msg.key().get(), keyDescriptor.get(), keySchemaInfo));
        builder.keyFormat(MessageFormat.PROTOBUF);
      } else {
        builder.key(new String(msg.key().get(), StandardCharsets.UTF_8));
        builder.keyFormat(MessageFormat.UNKNOWN);
      }
    }
    if (msg.value() != null) {
      if (valueDescriptor.isPresent()) {
        builder.value(parse(msg.value().get(), valueDescriptor.get(), valueSchemaInfo));
        builder.valueFormat(MessageFormat.PROTOBUF);
      } else {
        builder.value(new String(msg.value().get(), StandardCharsets.UTF_8));
        builder.valueFormat(MessageFormat.UNKNOWN);
      }
    }
    return builder.build();
  }

  private static long getDateDiffMinutes(Date date1, Date date2, TimeUnit timeUnit) {
    long diffInMillis = date2.getTime() - date1.getTime();
    return timeUnit.convert(diffInMillis, TimeUnit.MILLISECONDS);
  }

  private BufRepoInfo getDefaultBufRepoInfo() {
    return new BufRepoInfo(bufDefaultOwner, bufDefaultRepo, "main");
  }

  // Parse buf info from the type name and Buf schmea info. Schema info should be
  // of form "owner/repo:reference".
  private Optional<BufRepoInfo> getBufRepoInfo(String fullyQualifiedTypeName, String schemaInfo) {
    if (schemaInfo != null) {
      if (schemaInfo.length() > 0) {
        String[] repoParts = schemaInfo.split("/");
        if (repoParts.length == 2) {
          String[] referenceParts = repoParts[1].split(":");
          if (referenceParts.length == 2) {
            return Optional.of(new BufRepoInfo(repoParts[0], referenceParts[0], referenceParts[1]));
          } else {
            return Optional.of(new BufRepoInfo(repoParts[0], repoParts[1], "main"));
          }
        }
      }
    }

    String bufOwner = bufDefaultOwner;
    String bufRepo = "";

    String bufOwnerRepoInfo = bufOwnerRepoByProtobufMessageName.get(fullyQualifiedTypeName);

    if (bufOwnerRepoInfo != null) {
      String[] parts = bufOwnerRepoInfo.split("/");
      if (parts.length != 2) {
        log.error("Cannot parse Buf owner and repo info from {}, make sure it is in the 'owner/repo' format",
            bufOwnerRepoInfo);
      } else {
        return Optional.of(new BufRepoInfo(parts[0], parts[1], "main"));
      }
    } else {
      String[] parts = fullyQualifiedTypeName.split("\\.");

      if (parts.length == 0) {
        log.warn("Cannot infer Buf repo name from type {}", fullyQualifiedTypeName);
      } else {
        return Optional.of(new BufRepoInfo(bufDefaultOwner, parts[0], "main"));
      }
    }

    return Optional.empty();
  }

  private Optional<Descriptor> getDescriptor(String fullyQualifiedTypeName, String schemaInfo) {
    if (fullyQualifiedTypeName.equals(googleProtobufAnyType)) {
      return Optional.of(Any.getDescriptor());
    }

    Optional<BufRepoInfo> bufRepoInfo = getBufRepoInfo(fullyQualifiedTypeName, schemaInfo);
    if (bufRepoInfo.isEmpty()) {
      log.error("could not get Buf repo info for {}", fullyQualifiedTypeName);
      return Optional.empty();
    }

    String cacheKey = String.format("%s/%s/%s:%s", bufRepoInfo.get().getOwner(), bufRepoInfo.get().getRepo(),
        fullyQualifiedTypeName,
        bufRepoInfo.get().getReference());

    Date currentDate = new Date();
    CachedDescriptor cachedDescriptor = cachedMessageDescriptorMap.get(cacheKey);
    if (cachedDescriptor != null) {
      if (getDateDiffMinutes(cachedDescriptor.getTimeCached(), currentDate,
          TimeUnit.SECONDS) < cachedMessageDescriptorRetentionSeconds) {
        return cachedDescriptor.getDescriptor();
      }
    }

    log.info("Get descriptor from Buf {}/{}:{}/{}", bufRepoInfo.get().getOwner(), bufRepoInfo.get().getRepo(),
        bufRepoInfo.get().getReference(), fullyQualifiedTypeName);

    Optional<Descriptor> descriptor = bufClient.getDescriptor(bufRepoInfo.get().getOwner(), bufRepoInfo.get().getRepo(),
        bufRepoInfo.get().getReference(), fullyQualifiedTypeName);

    if (descriptor.isEmpty()) {
      BufRepoInfo defaultRepoInfo = getDefaultBufRepoInfo();

      log.info("Not found, falling back to Buf repo {}/{}:{}/{}", defaultRepoInfo.getOwner(), defaultRepoInfo.getRepo(),
          defaultRepoInfo.getReference(), fullyQualifiedTypeName);

      descriptor = bufClient.getDescriptor(defaultRepoInfo.getOwner(), defaultRepoInfo.getRepo(),
          defaultRepoInfo.getReference(), fullyQualifiedTypeName);
    }

    if (descriptor.isEmpty() && cachedDescriptor != null) {
      log.info("Not found, falling back to cached descriptor");
      descriptor = cachedDescriptor.getDescriptor();
    }

    cachedDescriptor = new CachedDescriptor(currentDate, descriptor);
    cachedMessageDescriptorMap.put(cacheKey, cachedDescriptor);

    return descriptor;
  }

  private Optional<JsonFormat.TypeRegistry> getTypeRegistry(BufRepoInfo bufRepoInfo) {
    String cacheKey = String.format("%s/%s:%s", bufRepoInfo.getOwner(), bufRepoInfo.getRepo(),
        bufRepoInfo.getReference());

    Date currentDate = new Date();
    CachedTypeRegistry cachedTypeRegistry = cachedTypeRegistryMap.get(cacheKey);
    if (cachedTypeRegistry != null) {
      if (getDateDiffMinutes(cachedTypeRegistry.getTimeCached(), currentDate,
          TimeUnit.SECONDS) < cachedMessageDescriptorRetentionSeconds) {
        return cachedTypeRegistry.getTypeRegistry();
      }
    }

    log.info("Get file descriptors from Buf {}/{}", bufRepoInfo.getOwner(), bufRepoInfo.getRepo());

    List<FileDescriptor> fileDescriptors = bufClient.getFileDescriptors(bufRepoInfo.getOwner(),
        bufRepoInfo.getRepo(), bufRepoInfo.getReference());

    Optional<JsonFormat.TypeRegistry> typeRegistry = Optional.empty();

    if (!fileDescriptors.isEmpty()) {
      JsonFormat.TypeRegistry.Builder builder = JsonFormat.TypeRegistry.newBuilder();

      for (FileDescriptor fileDescriptor : fileDescriptors) {
        for (Descriptor descriptor : fileDescriptor.getMessageTypes()) {
          builder.add(descriptor);
        }
      }

      typeRegistry = Optional.of(builder.build());
    }

    cachedTypeRegistry = new CachedTypeRegistry(currentDate, typeRegistry);
    cachedTypeRegistryMap.put(cacheKey, cachedTypeRegistry);

    return typeRegistry;
  }

  private String parse(byte[] value, Descriptor descriptor, String schemaInfo) {
    try {
      DynamicMessage protoMsg = DynamicMessage.parseFrom(
          descriptor,
          new ByteArrayInputStream(value));

      if (descriptor.getFullName().equals(googleProtobufAnyType)) {
        Any anyMsg = Any.parseFrom(value);

        // Get the fully qualified type name from a URL like
        // type.googleapis.com/google.protobuf.Duration.
        String type = anyMsg.getTypeUrl();
        String[] parts = anyMsg.getTypeUrl().split("/");
        if (parts.length == 2) {
          type = parts[1];
        }
        Optional<Descriptor> valueDescriptor = getDescriptor(type, null);

        if (valueDescriptor.isPresent()) {
          JsonFormat.TypeRegistry typeRegistry = JsonFormat.TypeRegistry.newBuilder()
              .add(valueDescriptor.get())
              .build();

          JsonFormat.Printer printer = JsonFormat.printer().usingTypeRegistry(typeRegistry);

          return printer.print(protoMsg);
        }
      } else {
        Optional<BufRepoInfo> bufRepoInfo = getBufRepoInfo(descriptor.getFullName(), schemaInfo);
        if (bufRepoInfo.isPresent()) {
          Optional<JsonFormat.TypeRegistry> typeRegistry = getTypeRegistry(bufRepoInfo.get());
          if (typeRegistry.isPresent()) {
            JsonFormat.Printer printer = JsonFormat.printer().usingTypeRegistry(typeRegistry.get());

            return printer.print(protoMsg);
          }
        }
      }

      return JsonFormat.printer().print(protoMsg);
    } catch (IOException e) {
      log.error("failed protobuf derserialization", e);
    }

    // Try using the default repo info.
    try {
      DynamicMessage protoMsg = DynamicMessage.parseFrom(
          descriptor,
          new ByteArrayInputStream(value));

      BufRepoInfo defaultBufRepoInfo = getDefaultBufRepoInfo();
      Optional<JsonFormat.TypeRegistry> typeRegistry = getTypeRegistry(defaultBufRepoInfo);
      if (typeRegistry.isPresent()) {
        JsonFormat.Printer printer = JsonFormat.printer().usingTypeRegistry(typeRegistry.get());

        return printer.print(protoMsg);
      }
    } catch (IOException e) {
      log.error("failed protobuf derserialization with default repo info", e);
    }

    return new String(value, StandardCharsets.UTF_8);
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
      @Nullable String key,
      @Nullable String data,
      @Nullable Integer partition) {
    if (data == null) {
      return new ProducerRecord<>(topic, partition, Objects.requireNonNull(key).getBytes(), null);
    }

    Optional<ProtoSchema> protoSchema = protoSchemaFromTopic(topic);
    if (!protoSchema.isPresent()) {
      throw new IllegalStateException("Could not infer proto schema from topic " + topic);
    }

    Optional<Descriptor> descriptor = getDescriptor(protoSchema.get().getFullyQualifiedTypeName(),
        protoSchema.get().getSchemaID());
    if (!descriptor.isPresent()) {
      throw new IllegalArgumentException("Could not get descriptor for "
          + protoSchema.get().getFullyQualifiedTypeName());
    }

    DynamicMessage.Builder builder = DynamicMessage.newBuilder(descriptor.get());

    DynamicMessage message;
    try {
      JsonFormat.parser().merge(data, builder);
      message = builder.build();
    } catch (InvalidProtocolBufferException e) {
      throw new UncheckedIOException("Failed to merge record for topic " + topic, e);
    }

    return new ProducerRecord<>(
        topic,
        partition,
        Optional.ofNullable(key).map(String::getBytes).orElse(null),
        message.toByteArray());
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {
    final MessageSchemaDTO schema = new MessageSchemaDTO()
        .name("Unknown")
        .source(MessageSchemaDTO.SourceEnum.UNKNOWN)
        .schema("");
    return new TopicMessageSchemaDTO()
        .key(schema)
        .value(schema);
  }
}
