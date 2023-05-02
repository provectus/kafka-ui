package com.provectus.kafka.ui.serdes.builtin;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.nio.ByteBuffer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;
import org.apache.kafka.common.protocol.ByteBufferAccessor;
import org.apache.kafka.common.protocol.types.ArrayOf;
import org.apache.kafka.common.protocol.types.BoundField;
import org.apache.kafka.common.protocol.types.Field;
import org.apache.kafka.common.protocol.types.Schema;
import org.apache.kafka.common.protocol.types.Struct;
import org.apache.kafka.common.protocol.types.Type;

public class ConsumerOffsetsSerde implements BuiltInSerde {

  private static final String TOPIC = "__consumer_offsets";

  public static String name() {
    return "__consumer_offsets";
  }

  @Override
  public boolean canBeAutoConfigured(PropertyResolver kafkaClusterProperties, PropertyResolver globalProperties) {
    return true;
  }

  @Override
  public Optional<String> getDescription() {
    return Optional.empty();
  }

  @Override
  public Optional<SchemaDescription> getSchema(String topic, Target type) {
    return Optional.empty();
  }

  @Override
  public boolean canDeserialize(String topic, Target type) {
    return topic.equals(TOPIC);
  }

  @Override
  public boolean canSerialize(String topic, Target type) {
    return false;
  }

  @Override
  public Serializer serializer(String topic, Target type) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Deserializer deserializer(String topic, Target type) {
    return switch (type) {
      case KEY -> keyDeserializer();
      case VALUE -> valueDeserializer();
    };
  }

  private Deserializer keyDeserializer() {
    final Schema commitKeySchema = new Schema(
        new Field("group", Type.STRING, ""),
        new Field("topic", Type.STRING, ""),
        new Field("partition", Type.INT32, "")
    );

    final Schema groupMetadataSchema = new Schema(
        new Field("group", Type.STRING, "")
    );

    return (headers, data) -> {
      var bb = ByteBuffer.wrap(data);
      short version = bb.getShort();
      return new DeserializeResult(
          toJson(
              switch (version) {
                case 0, 1 -> commitKeySchema.read(bb);
                case 2 -> groupMetadataSchema.read(bb);
                default -> throw new IllegalStateException("Unknown group metadata message version: " + version);
              }
          ),
          DeserializeResult.Type.JSON,
          Map.of()
      );
    };
  }

  private Deserializer valueDeserializer() {
    final Schema valueSchemaV0 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema valueSchemaV1 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, ""),
            new Field("expire_timestamp", Type.INT64, "")
        );

    final Schema valueSchemaV2 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema valueSchemaV3 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("leader_epoch", Type.INT32, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema metadataSchema0 =
        new Schema(
            new Field("protocol_type", Type.STRING, ""),
            new Field("generation", Type.INT32, ""),
            new Field("protocol", Type.NULLABLE_STRING, ""),
            new Field("leader", Type.NULLABLE_STRING, ""),
            new Field("members", new ArrayOf(new Schema(
                new Field("member_id", Type.STRING, ""),
                new Field("client_id", Type.STRING, ""),
                new Field("client_host", Type.STRING, ""),
                new Field("session_timeout", Type.INT32, ""),
                new Field("subscription", Type.BYTES, ""),
                new Field("assignment", Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema1 =
        new Schema(
            new Field("protocol_type", Type.STRING, ""),
            new Field("generation", Type.INT32, ""),
            new Field("protocol", Type.NULLABLE_STRING, ""),
            new Field("leader", Type.NULLABLE_STRING, ""),
            new Field("members", new ArrayOf(new Schema(
                new Field("member_id", Type.STRING, ""),
                new Field("client_id", Type.STRING, ""),
                new Field("client_host", Type.STRING, ""),
                new Field("rebalance_timeout", Type.INT32, ""),
                new Field("session_timeout", Type.INT32, ""),
                new Field("subscription", Type.BYTES, ""),
                new Field("assignment", Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema2 =
        new Schema(
            new Field("protocol_type", Type.STRING, ""),
            new Field("generation", Type.INT32, ""),
            new Field("protocol", Type.NULLABLE_STRING, ""),
            new Field("leader", Type.NULLABLE_STRING, ""),
            new Field("current_state_timestamp", Type.INT64, ""),
            new Field("members", new ArrayOf(new Schema(
                new Field("member_id", Type.STRING, ""),
                new Field("client_id", Type.STRING, ""),
                new Field("client_host", Type.STRING, ""),
                new Field("rebalance_timeout", Type.INT32, ""),
                new Field("session_timeout", Type.INT32, ""),
                new Field("subscription", Type.BYTES, ""),
                new Field("assignment", Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema3 =
        new Schema(
            new Field("protocol_type", Type.STRING, ""),
            new Field("generation", Type.INT32, ""),
            new Field("protocol", Type.NULLABLE_STRING, ""),
            new Field("leader", Type.NULLABLE_STRING, ""),
            new Field("current_state_timestamp", Type.INT64, ""),
            new Field("members", new ArrayOf(new Schema(
                new Field("member_id", Type.STRING, ""),
                new Field("group_instance_id", Type.NULLABLE_STRING, ""),
                new Field("client_id", Type.STRING, ""),
                new Field("client_host", Type.STRING, ""),
                new Field("rebalance_timeout", Type.INT32, ""),
                new Field("session_timeout", Type.INT32, ""),
                new Field("subscription", Type.BYTES, ""),
                new Field("assignment", Type.BYTES, "")
            )), "")
        );

    return (headers, data) -> {
      var bb = ByteBuffer.wrap(data);
      short version = bb.getShort();

      String result = null;
      try {
        result = toJson(
            switch (version) {
              case 0 -> metadataSchema0.read(bb);
              case 1 -> metadataSchema1.read(bb);
              case 2 -> metadataSchema2.read(bb);
              case 3 -> metadataSchema3.read(bb);
              default -> throw new IllegalStateException("Unknown offset message version: " + version);
            }
        );
      } catch (Throwable e) {
        bb = bb.rewind();
        bb.getShort(); //skipping version
        result = toJson(
            switch (version) {
              case 0 -> valueSchemaV0.read(bb);
              case 1 -> valueSchemaV1.read(bb);
              case 2 -> valueSchemaV2.read(bb);
              case 3 -> valueSchemaV3.read(bb);
              default -> throw new IllegalStateException("Unknown offset message version: " + version);
            }
        );
      }

      return new DeserializeResult(
          result,
          DeserializeResult.Type.STRING,
          Map.of()
      );
    };
  }

  @SneakyThrows
  private String toJson(Struct s) {
    Map<String, Object> map = new LinkedHashMap<>();
    for (BoundField field : s.schema().fields()) {
      map.put(field.def.name, s.get(field));
    }
    return new JsonMapper().writeValueAsString(map);
  }
}
