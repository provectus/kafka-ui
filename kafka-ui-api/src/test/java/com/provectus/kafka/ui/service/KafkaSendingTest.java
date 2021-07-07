package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessage;
import com.provectus.kafka.ui.model.SeekDirection;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.model.TopicMessage;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Intention of this tests is to verify consistency between messages send and read logic & formats.
 * TODO: as an improvement this tests can be rewritten in @ParametrizedTest fashion,
 * it should increase readability.
 */
public class KafkaSendingTest extends AbstractBaseTest {

  private static final AvroSchema AVRO_SCHEMA_1 = new AvroSchema(
      "{"
          + "  \"type\": \"record\","
          + "  \"name\": \"TestAvroRecord1\","
          + "  \"fields\": ["
          + "    {"
          + "      \"name\": \"field1\","
          + "      \"type\": \"string\""
          + "    },"
          + "    {"
          + "      \"name\": \"field2\","
          + "      \"type\": \"int\""
          + "    }"
          + "  ]"
          + "}"
  );

  private static final AvroSchema AVRO_SCHEMA_2 = new AvroSchema(
      "{"
          + "  \"type\": \"record\","
          + "  \"name\": \"TestAvroRecord2\","
          + "  \"fields\": ["
          + "    {"
          + "      \"name\": \"f1\","
          + "      \"type\": \"int\""
          + "    },"
          + "    {"
          + "      \"name\": \"f2\","
          + "      \"type\": \"string\""
          + "    }"
          + "  ]"
          + "}"
  );

  private static final String AVRO_SCHEMA_1_JSON_RECORD
      = "{ \"field1\":\"testStr\", \"field2\": 123 }";
  private static final String AVRO_SCHEMA_2_JSON_RECORD
      = "{ \"f1\": 111, \"f2\": \"testStr\" }";


  private static final ProtobufSchema PROTOBUF_SCHEMA = new ProtobufSchema(
      "syntax = \"proto3\";\n"
          + "package com.provectus;\n"
          + "\n"
          + "message TestProtoRecord {\n"
          + "  string f1 = 1;\n"
          + "  int32 f2 = 2;\n"
          + "}\n"
          + "\n"
  );

  private static final String PROTOBUF_SCHEMA_JSON_RECORD = "{ \"f1\" : \"test str\", \"f2\" : 123 }";

  @Autowired
  private ClusterService clusterService;

  @Autowired
  private ClustersMetricsScheduler clustersMetricsScheduler;

  @Test
  void noSchemaWithNonNullableKeyValue() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessage()
                .key("testKey")
                .content("testValue")
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("testKey");
          assertThat(polled.getContent()).isEqualTo("testValue");
        });
  }

  @Test
  void noSchemaKeyIsNull() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessage()
                .key(null)
                .content("testValue")
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isNull();
          assertThat(polled.getContent()).isEqualTo("testValue");
        });
  }

  @Test
  void noSchemaValueIsNull() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessage()
                .key("testKey")
                .content(null)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("testKey");
          assertThat(polled.getContent()).isNull();
        });
  }

  @Test
  void nonNullableKvWithAvroSchema() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessage()
                .key(AVRO_SCHEMA_1_JSON_RECORD)
                .content(AVRO_SCHEMA_2_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertJsonIsEqual(AVRO_SCHEMA_1_JSON_RECORD, polled.getKey());
          assertJsonIsEqual(AVRO_SCHEMA_2_JSON_RECORD, polled.getContent());
        });
  }

  @Test
  void keyWithNoSchemaValueWithAvroSchema() {
    new SendAndReadSpec()
        .withValueSchema(AVRO_SCHEMA_1)
        .withMsgToSend(
            new CreateTopicMessage()
                .key("testKey")
                .content(AVRO_SCHEMA_1_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("testKey");
          assertJsonIsEqual(AVRO_SCHEMA_1_JSON_RECORD, polled.getContent());
        });
  }

  @Test
  void keyWithAvroSchemaValueWithNoSchema() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withMsgToSend(
            new CreateTopicMessage()
                .key(AVRO_SCHEMA_1_JSON_RECORD)
                .content("testVal")
        )
        .doAssert(polled -> {
          assertJsonIsEqual(AVRO_SCHEMA_1_JSON_RECORD, polled.getKey());
          assertThat(polled.getContent()).isEqualTo("testVal");
        });
  }

  @Test
  void keyWithNoSchemaValueWithProtoSchema() {
    new SendAndReadSpec()
        .withValueSchema(PROTOBUF_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessage()
                .key("testKey")
                .content(PROTOBUF_SCHEMA_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("testKey");
          assertJsonIsEqual(PROTOBUF_SCHEMA_JSON_RECORD, polled.getContent());
        });
  }

  @Test
  void keyWithAvroSchemaValueWithAvroSchemaKeyIsNull() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessage()
                .key(null)
                .content(AVRO_SCHEMA_2_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isNull();
          assertJsonIsEqual(AVRO_SCHEMA_2_JSON_RECORD, polled.getContent());
        });
  }

  @Test
  void keyWithAvroSchemaValueWithAvroSchemaValueIsNull() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessage()
                .key(AVRO_SCHEMA_1_JSON_RECORD)
                .content(null)
        )
        .doAssert(polled -> {
          assertJsonIsEqual(AVRO_SCHEMA_1_JSON_RECORD, polled.getKey());
          assertThat(polled.getContent()).isNull();
        });
  }

  @Test
  void keyWithAvroSchemaValueWithProtoSchema() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(PROTOBUF_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessage()
                .key(AVRO_SCHEMA_1_JSON_RECORD)
                .content(PROTOBUF_SCHEMA_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertJsonIsEqual(AVRO_SCHEMA_1_JSON_RECORD, polled.getKey());
          assertJsonIsEqual(PROTOBUF_SCHEMA_JSON_RECORD, polled.getContent());
        });
  }

  @SneakyThrows
  private void assertJsonIsEqual(String expectedJsonStr, Object actual) {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode actualJsonNode = objectMapper.readTree(objectMapper.writeValueAsString(actual));
    JsonNode expectedJsonNode = objectMapper.readTree(expectedJsonStr);
    assertThat(actualJsonNode).isEqualTo(expectedJsonNode);
  }

  class SendAndReadSpec {
    CreateTopicMessage msgToSend;
    ParsedSchema keySchema;
    ParsedSchema valueSchema;

    public SendAndReadSpec withMsgToSend(CreateTopicMessage msg) {
      this.msgToSend = msg;
      return this;
    }

    public SendAndReadSpec withKeySchema(ParsedSchema keyScheam) {
      this.keySchema = keyScheam;
      return this;
    }

    public SendAndReadSpec withValueSchema(ParsedSchema valueSchema) {
      this.valueSchema = valueSchema;
      return this;
    }

    @SneakyThrows
    public void doAssert(Consumer<TopicMessage> msgAssert) {
      Preconditions.checkArgument(msgToSend != null);
      String topic = UUID.randomUUID().toString();
      createTopic(new NewTopic(topic, 1, (short) 1));
      if (keySchema != null) {
        schemaRegistry.schemaRegistryClient().register(topic + "-key", keySchema);
      }
      if (valueSchema != null) {
        schemaRegistry.schemaRegistryClient().register(topic + "-value", valueSchema);
      }

      // need to update to see new topic & schemas
      clustersMetricsScheduler.updateMetrics();
      try {
        clusterService.sendMessage(LOCAL, topic, msgToSend).block();
        TopicMessage polled = clusterService.getMessages(
            LOCAL,
            topic,
            new ConsumerPosition(
                SeekType.BEGINNING,
                Map.of(new TopicPartition(topic, 0), 0L),
                SeekDirection.FORWARD
            ),
            null,
            1
        ).blockLast(Duration.ofSeconds(5));

        assertThat(polled).isNotNull();
        assertThat(polled.getPartition()).isEqualTo(0);
        assertThat(polled.getOffset()).isNotNull();
        msgAssert.accept(polled);
      } finally {
        deleteTopic(topic);
      }
    }
  }

}
