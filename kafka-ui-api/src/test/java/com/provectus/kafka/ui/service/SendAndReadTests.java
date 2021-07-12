package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Objects;
import java.util.UUID;
import java.util.function.Consumer;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.junit.Assert;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class SendAndReadTests extends AbstractBaseTest {

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

  private static final String AVRO_SCHEMA_2_JSON_RECORD = "{ \"f1\": 111, \"f2\": \"testStr\" }";

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

  private static final String PROTOBUF_SCHEMA_JSON_RECORD
      = "{ \"f1\" : \"test str\", \"f2\" : 123 }";

  @Autowired
  private ClusterService clusterService;

  @Autowired
  private ClustersMetricsScheduler clustersMetricsScheduler;

  @Test
  void noSchemaStringKeyStringValue() {
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
  void noSchemaJsonKeyJsonValue() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessage()
                .key("{ \"f1\": 111, \"f2\": \"testStr1\" }")
                .content("{ \"f1\": 222, \"f2\": \"testStr2\" }")
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("{ \"f1\": 111, \"f2\": \"testStr1\" }");
          assertThat(polled.getContent()).isEqualTo("{ \"f1\": 222, \"f2\": \"testStr2\" }");
        });
  }

  @Test
  void keyIsIntValueIsDoubleShouldBeSerializedAsStrings() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessage()
                .key("123")
                .content("234.56")
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("123");
          assertThat(polled.getContent()).isEqualTo("234.56");
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
          assertJsonEqual(polled.getKey(), AVRO_SCHEMA_1_JSON_RECORD);
          assertJsonEqual(polled.getContent(), AVRO_SCHEMA_2_JSON_RECORD);
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
          assertJsonEqual(polled.getContent(), AVRO_SCHEMA_1_JSON_RECORD);
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
          assertJsonEqual(polled.getKey(), AVRO_SCHEMA_1_JSON_RECORD);
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
          assertJsonEqual(polled.getContent(), PROTOBUF_SCHEMA_JSON_RECORD);
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
          assertJsonEqual(polled.getContent(), AVRO_SCHEMA_2_JSON_RECORD);
        });
  }

  @Test
  void valueWithAvroSchemaShouldThrowExceptionArgIsNotValidJsonObject() {
    assertThatThrownBy(() -> {
      new SendAndReadSpec()
          .withValueSchema(AVRO_SCHEMA_2)
          .withMsgToSend(
              new CreateTopicMessage()
                  .content("not a json object")
          )
          .doAssert(polled -> Assertions.fail());
    }).hasMessageContaining("Failed to serialize record");
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
          assertJsonEqual(polled.getKey(), AVRO_SCHEMA_1_JSON_RECORD);
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
          assertJsonEqual(polled.getKey(), AVRO_SCHEMA_1_JSON_RECORD);
          assertJsonEqual(polled.getContent(), PROTOBUF_SCHEMA_JSON_RECORD);
        });
  }

  @Test
  void valueWithProtoSchemaShouldThrowExceptionArgIsNotValidJsonObject() {
    assertThatThrownBy(() -> {
      new SendAndReadSpec()
          .withValueSchema(PROTOBUF_SCHEMA)
          .withMsgToSend(
              new CreateTopicMessage()
                  .content("not a json object")
          )
          .doAssert(polled -> Assertions.fail());
    }).hasMessageContaining("Failed to serialize record");
  }


  @SneakyThrows
  private void assertJsonEqual(String actual, String expected) {
    var mapper = new ObjectMapper();
    assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
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
      Objects.requireNonNull(msgToSend);
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
