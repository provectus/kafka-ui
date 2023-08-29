package com.provectus.kafka.ui.serdes.builtin;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
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

  private static final String ASSIGNMENT = "assignment";
  private static final String CLIENT_HOST = "client_host";
  private static final String CLIENT_ID = "client_id";
  private static final String COMMIT_TIMESTAMP = "commit_timestamp";
  private static final String CURRENT_STATE_TIMESTAMP = "current_state_timestamp";
  private static final String GENERATION = "generation";
  private static final String LEADER = "leader";
  private static final String MEMBERS = "members";
  private static final String MEMBER_ID = "member_id";
  private static final String METADATA = "metadata";
  private static final String OFFSET = "offset";
  private static final String PROTOCOL = "protocol";
  private static final String PROTOCOL_TYPE = "protocol_type";
  private static final String REBALANCE_TIMEOUT = "rebalance_timeout";
  private static final String SESSION_TIMEOUT = "session_timeout";
  private static final String SUBSCRIPTION = "subscription";

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
            new Field(OFFSET, Type.INT64, ""),
            new Field(METADATA, Type.STRING, ""),
            new Field(COMMIT_TIMESTAMP, Type.INT64, "")
        );

    final Schema commitOffsetSchemaV1 =
        new Schema(
            new Field(OFFSET, Type.INT64, ""),
            new Field(METADATA, Type.STRING, ""),
            new Field(COMMIT_TIMESTAMP, Type.INT64, ""),
            new Field("expire_timestamp", Type.INT64, "")
        );

    final Schema commitOffsetSchemaV2 =
        new Schema(
            new Field(OFFSET, Type.INT64, ""),
            new Field(METADATA, Type.STRING, ""),
            new Field(COMMIT_TIMESTAMP, Type.INT64, "")
        );

    final Schema commitOffsetSchemaV3 =
        new Schema(
            new Field(OFFSET, Type.INT64, ""),
            new Field("leader_epoch", Type.INT32, ""),
            new Field(METADATA, Type.STRING, ""),
            new Field(COMMIT_TIMESTAMP, Type.INT64, "")
        );

    final Schema commitOffsetSchemaV4 = new Schema(
        new Field(OFFSET, Type.INT64, ""),
        new Field("leader_epoch", Type.INT32, ""),
        new Field(METADATA, Type.COMPACT_STRING, ""),
        new Field(COMMIT_TIMESTAMP, Type.INT64, ""),
        Field.TaggedFieldsSection.of()
    );

    final Schema metadataSchema0 =
        new Schema(
            new Field(PROTOCOL_TYPE, Type.STRING, ""),
            new Field(GENERATION, Type.INT32, ""),
            new Field(PROTOCOL, Type.NULLABLE_STRING, ""),
            new Field(LEADER, Type.NULLABLE_STRING, ""),
            new Field(MEMBERS, new ArrayOf(new Schema(
                new Field(MEMBER_ID, Type.STRING, ""),
                new Field(CLIENT_ID, Type.STRING, ""),
                new Field(CLIENT_HOST, Type.STRING, ""),
                new Field(SESSION_TIMEOUT, Type.INT32, ""),
                new Field(SUBSCRIPTION, Type.BYTES, ""),
                new Field(ASSIGNMENT, Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema1 =
        new Schema(
            new Field(PROTOCOL_TYPE, Type.STRING, ""),
            new Field(GENERATION, Type.INT32, ""),
            new Field(PROTOCOL, Type.NULLABLE_STRING, ""),
            new Field(LEADER, Type.NULLABLE_STRING, ""),
            new Field(MEMBERS, new ArrayOf(new Schema(
                new Field(MEMBER_ID, Type.STRING, ""),
                new Field(CLIENT_ID, Type.STRING, ""),
                new Field(CLIENT_HOST, Type.STRING, ""),
                new Field(REBALANCE_TIMEOUT, Type.INT32, ""),
                new Field(SESSION_TIMEOUT, Type.INT32, ""),
                new Field(SUBSCRIPTION, Type.BYTES, ""),
                new Field(ASSIGNMENT, Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema2 =
        new Schema(
            new Field(PROTOCOL_TYPE, Type.STRING, ""),
            new Field(GENERATION, Type.INT32, ""),
            new Field(PROTOCOL, Type.NULLABLE_STRING, ""),
            new Field(LEADER, Type.NULLABLE_STRING, ""),
            new Field(CURRENT_STATE_TIMESTAMP, Type.INT64, ""),
            new Field(MEMBERS, new ArrayOf(new Schema(
                new Field(MEMBER_ID, Type.STRING, ""),
                new Field(CLIENT_ID, Type.STRING, ""),
                new Field(CLIENT_HOST, Type.STRING, ""),
                new Field(REBALANCE_TIMEOUT, Type.INT32, ""),
                new Field(SESSION_TIMEOUT, Type.INT32, ""),
                new Field(SUBSCRIPTION, Type.BYTES, ""),
                new Field(ASSIGNMENT, Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema3 =
        new Schema(
            new Field(PROTOCOL_TYPE, Type.STRING, ""),
            new Field(GENERATION, Type.INT32, ""),
            new Field(PROTOCOL, Type.NULLABLE_STRING, ""),
            new Field(LEADER, Type.NULLABLE_STRING, ""),
            new Field(CURRENT_STATE_TIMESTAMP, Type.INT64, ""),
            new Field(MEMBERS, new ArrayOf(new Schema(
                new Field(MEMBER_ID, Type.STRING, ""),
                new Field("group_instance_id", Type.NULLABLE_STRING, ""),
                new Field(CLIENT_ID, Type.STRING, ""),
                new Field(CLIENT_HOST, Type.STRING, ""),
                new Field(REBALANCE_TIMEOUT, Type.INT32, ""),
                new Field(SESSION_TIMEOUT, Type.INT32, ""),
                new Field(SUBSCRIPTION, Type.BYTES, ""),
                new Field(ASSIGNMENT, Type.BYTES, "")
            )), "")
        );

    final Schema metadataSchema4 =
        new Schema(
            new Field(PROTOCOL_TYPE, Type.COMPACT_STRING, ""),
            new Field(GENERATION, Type.INT32, ""),
            new Field(PROTOCOL, Type.COMPACT_NULLABLE_STRING, ""),
            new Field(LEADER, Type.COMPACT_NULLABLE_STRING, ""),
            new Field(CURRENT_STATE_TIMESTAMP, Type.INT64, ""),
            new Field(MEMBERS, new CompactArrayOf(new Schema(
                new Field(MEMBER_ID, Type.COMPACT_STRING, ""),
                new Field("group_instance_id", Type.COMPACT_NULLABLE_STRING, ""),
                new Field(CLIENT_ID, Type.COMPACT_STRING, ""),
                new Field(CLIENT_HOST, Type.COMPACT_STRING, ""),
                new Field(REBALANCE_TIMEOUT, Type.INT32, ""),
                new Field(SESSION_TIMEOUT, Type.INT32, ""),
                new Field(SUBSCRIPTION, Type.COMPACT_BYTES, ""),
                new Field(ASSIGNMENT, Type.COMPACT_BYTES, ""),
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
      // so, we are trying to parse into metadata first and after into commit msg
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
