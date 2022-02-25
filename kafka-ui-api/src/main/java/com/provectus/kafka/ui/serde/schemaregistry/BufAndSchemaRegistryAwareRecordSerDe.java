package com.provectus.kafka.ui.serde.schemaregistry;


import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.client.BufSchemaRegistryClient;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.ProtoSchema;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class BufAndSchemaRegistryAwareRecordSerDe implements RecordSerDe {

  private final SchemaRegistryAwareRecordSerDe schemaRegistryAwareRecordSerDe;
  private final KafkaCluster cluster;
  private final BufSchemaRegistryClient bufClient;

  public BufAndSchemaRegistryAwareRecordSerDe(KafkaCluster cluster) {
    this(cluster, null, createBufRegistryClient(cluster));
  }

  @VisibleForTesting
  public BufAndSchemaRegistryAwareRecordSerDe(
      KafkaCluster cluster,
      SchemaRegistryClient schemaRegistryClient,
      BufSchemaRegistryClient bufClient) {
    if (schemaRegistryClient == null) {
      this.schemaRegistryAwareRecordSerDe = new SchemaRegistryAwareRecordSerDe(cluster);
    } else {
      // used for testing
      this.schemaRegistryAwareRecordSerDe = new SchemaRegistryAwareRecordSerDe(cluster, schemaRegistryClient);
    }
    this.cluster = cluster;
    this.bufClient = bufClient;
  }

  private static BufSchemaRegistryClient createBufRegistryClient(KafkaCluster cluster) {
    // TODO: pass args from cluster to buf constructor
    return new BufSchemaRegistryClient();
  }

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    ProtoSchema protoSchema = protoSchemaFromHeaders(msg.headers());
    if (protoSchema != null) {
      // TODO: parse message
      log.info("Skipping buf for schema: {}", protoSchema.getFullyQualifiedTypeName());
      return this.schemaRegistryAwareRecordSerDe.deserialize(msg);
    }

    protoSchema = protoSchemaFromTopic(msg.topic());

    if (protoSchema != null) {
      // TODO: parse message and return it
      log.info("Skipping buf for schema: {}", protoSchema.getFullyQualifiedTypeName());
      return this.schemaRegistryAwareRecordSerDe.deserialize(msg);
    }

    return this.schemaRegistryAwareRecordSerDe.deserialize(msg);
  }

  @Nullable ProtoSchema protoSchemaFromHeaders(Headers headers) {
    // extract PROTOBUF_TYPE header
    String fullyQualifiedTypeName = null;
    for (Header header : headers.headers("PROTOBUF_TYPE")) {
      fullyQualifiedTypeName = new String(header.value());
    }

    if (fullyQualifiedTypeName == null) {
      return null;
    }

    // extract PROTOBUF_SCHEMA_ID header
    String schemaID = null;
    for (Header header : headers.headers("PROTOBUF_SCHEMA_ID")) {
      schemaID = new String(header.value());
    }

    ProtoSchema ret = new ProtoSchema();
    ret.setFullyQualifiedTypeName(fullyQualifiedTypeName);
    ret.setSchemaID(schemaID);
    return ret;
  }

  @Nullable ProtoSchema protoSchemaFromTopic(String topic) {
    if (!topic.contains(".proto.")) {
      return null;
    }

    // extract fqtn
    String[] parts = topic.split("\\.proto\\.");
    ProtoSchema ret = new ProtoSchema();
    ret.setFullyQualifiedTypeName(parts[parts.length - 1]);
    return ret;
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable String key,
                                                  @Nullable String data,
                                                  @Nullable Integer partition) {
    return this.schemaRegistryAwareRecordSerDe.serialize(topic, key, data, partition);
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {
    // TODO: what is the importance of this?
    final MessageSchemaDTO schema = new MessageSchemaDTO()
        .name("unknown")
        .source(MessageSchemaDTO.SourceEnum.UNKNOWN)
        .schema("CLST_PROTOBUF");
    return new TopicMessageSchemaDTO()
        .key(schema)
        .value(schema);
  }
}
