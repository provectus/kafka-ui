package com.provectus.kafka.ui.serdes.builtin;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serdes.BuiltInSerde;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;
import org.apache.kafka.common.protocol.types.ArrayOf;
import org.apache.kafka.common.protocol.types.BoundField;
import org.apache.kafka.common.protocol.types.CompactArrayOf;
import org.apache.kafka.common.protocol.types.Field;
import org.apache.kafka.common.protocol.types.Schema;
import org.apache.kafka.common.protocol.types.Struct;
import org.apache.kafka.common.protocol.types.Type;

// Deserialization logic and message's schemas can be found in
// kafka.coordinator.group.GroupMetadataManager (readMessageKey, readOffsetMessageValue, readGroupMessageValue)
public class ConsumerOffsetsSerde implements BuiltInSerde {

  private static final JsonMapper JSON_MAPPER = createMapper();

  public static final String TOPIC = "__consumer_offsets";

  public static String name() {
    return "__consumer_offsets";
  }

  private static JsonMapper createMapper() {
    var module = new SimpleModule();
    module.addSerializer(Struct.class, new JsonSerializer<>() {
      @Override
      public void serialize(Struct value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        for (BoundField field : value.schema().fields()) {
          var fieldVal = value.get(field);
          gen.writeObjectField(field.def.name, fieldVal);
        }
        gen.writeEndObject();
      }
    });
    var mapper = new JsonMapper();
    mapper.registerModule(module);
    return mapper;
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
    final Schema commitOffsetSchemaV0 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema commitOffsetSchemaV1 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, ""),
            new Field("expire_timestamp", Type.INT64, "")
        );

    final Schema commitOffsetSchemaV2 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema commitOffsetSchemaV3 =
        new Schema(
            new Field("offset", Type.INT64, ""),
            new Field("leader_epoch", Type.INT32, ""),
            new Field("metadata", Type.STRING, ""),
            new Field("commit_timestamp", Type.INT64, "")
        );

    final Schema commitOffsetSchemaV4 = new Schema(
        new Field("offset", Type.INT64, ""),
        new Field("leader_epoch", Type.INT32, ""),
        new Field("metadata", Type.COMPACT_STRING, ""),
        new Field("commit_timestamp", Type.INT64, ""),
        Field.TaggedFieldsSection.of()
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

    final Schema metadataSchema4 =
        new Schema(
            new Field("protocol_type", Type.COMPACT_STRING, ""),
            new Field("generation", Type.INT32, ""),
            new Field("protocol", Type.COMPACT_NULLABLE_STRING, ""),
            new Field("leader", Type.COMPACT_NULLABLE_STRING, ""),
            new Field("current_state_timestamp", Type.INT64, ""),
            new Field("members", new CompactArrayOf(new Schema(
                new Field("member_id", Type.COMPACT_STRING, ""),
                new Field("group_instance_id", Type.COMPACT_NULLABLE_STRING, ""),
                new Field("client_id", Type.COMPACT_STRING, ""),
                new Field("client_host", Type.COMPACT_STRING, ""),
                new Field("rebalance_timeout", Type.INT32, ""),
                new Field("session_timeout", Type.INT32, ""),
                new Field("subscription", Type.COMPACT_BYTES, ""),
                new Field("assignment", Type.COMPACT_BYTES, ""),
                Field.TaggedFieldsSection.of()
            )), ""),
            Field.TaggedFieldsSection.of()
        );

    return (headers, data) -> {
      String result;
      var bb = ByteBuffer.wrap(data);
      short version = bb.getShort();
      // ideally, we should distinguish if value is commit or metadata
      // by checking record's key, but our current serde structure doesn't allow that.
      // so, we trying to parse into metadata first and after into commit msg
      try {
        result = toJson(
            switch (version) {
              case 0 -> metadataSchema0.read(bb);
              case 1 -> metadataSchema1.read(bb);
              case 2 -> metadataSchema2.read(bb);
              case 3 -> metadataSchema3.read(bb);
              case 4 -> metadataSchema4.read(bb);
              default -> throw new IllegalArgumentException("Unrecognized version: " + version);
            }
        );
      } catch (Throwable e) {
        bb = bb.rewind();
        bb.getShort(); // skipping version
        result = toJson(
            switch (version) {
              case 0 -> commitOffsetSchemaV0.read(bb);
              case 1 -> commitOffsetSchemaV1.read(bb);
              case 2 -> commitOffsetSchemaV2.read(bb);
              case 3 -> commitOffsetSchemaV3.read(bb);
              case 4 -> commitOffsetSchemaV4.read(bb);
              default -> throw new IllegalArgumentException("Unrecognized version: " + version);
            }
        );
      }

      if (bb.remaining() != 0) {
        throw new IllegalArgumentException(
            "Message buffer is not read to the end, which is likely means message is unrecognized");
      }
      return new DeserializeResult(
          result,
          DeserializeResult.Type.JSON,
          Map.of()
      );
    };
  }

  @SneakyThrows
  private String toJson(Struct s) {
    return JSON_MAPPER.writeValueAsString(s);
  }
}
