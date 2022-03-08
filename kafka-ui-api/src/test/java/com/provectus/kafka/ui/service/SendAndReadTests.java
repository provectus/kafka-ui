package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageFormatDTO;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Consumer;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import reactor.test.StepVerifier;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
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

  private static final AvroSchema AVRO_SCHEMA_PRIMITIVE_STRING =
      new AvroSchema("{ \"type\": \"string\" }");

  private static final AvroSchema AVRO_SCHEMA_PRIMITIVE_INT =
      new AvroSchema("{ \"type\": \"int\" }");


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


  private static final JsonSchema JSON_SCHEMA = new JsonSchema(
      "{ "
          + "  \"$schema\": \"http://json-schema.org/draft-07/schema#\", "
          + "  \"$id\": \"http://example.com/myURI.schema.json\", "
          + "  \"title\": \"TestRecord\","
          + "  \"type\": \"object\","
          + "  \"additionalProperties\": false,"
          + "  \"properties\": {"
          + "    \"f1\": {"
          + "      \"type\": \"integer\""
          + "    },"
          + "    \"f2\": {"
          + "      \"type\": \"string\""
          + "    },"
          // it is important special case since there is code in KafkaJsonSchemaSerializer
          // that checks fields with this name (it should be worked around)
          + "    \"schema\": {"
          + "      \"type\": \"string\""
          + "    }"
          + "  }"
          + "}"
  );

  private static final String JSON_SCHEMA_RECORD
      = "{ \"f1\": 12, \"f2\": \"testJsonSchema1\", \"schema\": \"some txt\" }";

  private KafkaCluster targetCluster;

  @Autowired
  private MessagesService messagesService;

  @Autowired
  private ClustersStorage clustersStorage;

  @Autowired
  private ClustersMetricsScheduler clustersMetricsScheduler;

  @BeforeEach
  void init() {
    targetCluster = clustersStorage.getClusterByName(LOCAL).get();
  }

  @Test
  void noSchemaStringKeyStringValue() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
                .key("testKey")
                .content(null)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("testKey");
          assertThat(polled.getContent()).isNull();
        });
  }

  @Test
  void primitiveAvroSchemas() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_PRIMITIVE_STRING)
        .withValueSchema(AVRO_SCHEMA_PRIMITIVE_INT)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key("\"some string\"")
                .content("123")
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isEqualTo("\"some string\"");
          assertThat(polled.getContent()).isEqualTo("123");
        });
  }

  @Test
  void nonNullableKvWithAvroSchema() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
    new SendAndReadSpec()
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                // f2 has type object instead of string
                .content("{ \"f1\": 111, \"f2\": {} }")
        )
        .assertSendThrowsException();
  }

  @Test
  void keyWithAvroSchemaValueWithAvroSchemaValueIsNull() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessageDTO()
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
            new CreateTopicMessageDTO()
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
    new SendAndReadSpec()
        .withValueSchema(PROTOBUF_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                // f2 field has type object instead of int
                .content("{ \"f1\" : \"test str\", \"f2\" : {} }"))
        .assertSendThrowsException();
  }

  @Test
  void keyWithProtoSchemaValueWithJsonSchema() {
    new SendAndReadSpec()
        .withKeySchema(PROTOBUF_SCHEMA)
        .withValueSchema(JSON_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(PROTOBUF_SCHEMA_JSON_RECORD)
                .content(JSON_SCHEMA_RECORD)
        )
        .doAssert(polled -> {
          assertJsonEqual(polled.getKey(), PROTOBUF_SCHEMA_JSON_RECORD);
          assertJsonEqual(polled.getContent(), JSON_SCHEMA_RECORD);
        });
  }

  @Test
  void keyWithJsonValueWithJsonSchemaKeyValueIsNull() {
    new SendAndReadSpec()
        .withKeySchema(JSON_SCHEMA)
        .withValueSchema(JSON_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(JSON_SCHEMA_RECORD)
        )
        .doAssert(polled -> {
          assertJsonEqual(polled.getKey(), JSON_SCHEMA_RECORD);
          assertThat(polled.getContent()).isNull();
        });
  }

  @Test
  void valueWithJsonSchemaThrowsExceptionIfArgIsNotValidJsonObject() {
    new SendAndReadSpec()
        .withValueSchema(JSON_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                // 'f2' field has has type object instead of string
                .content("{ \"f1\": 12, \"f2\": {}, \"schema\": \"some txt\" }")
        )
        .assertSendThrowsException();
  }

  @Test
  void topicMessageMetadataAvro() {
    new SendAndReadSpec()
        .withKeySchema(AVRO_SCHEMA_1)
        .withValueSchema(AVRO_SCHEMA_2)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(AVRO_SCHEMA_1_JSON_RECORD)
                .content(AVRO_SCHEMA_2_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertJsonEqual(polled.getKey(), AVRO_SCHEMA_1_JSON_RECORD);
          assertJsonEqual(polled.getContent(), AVRO_SCHEMA_2_JSON_RECORD);
          assertThat(polled.getKeySize()).isEqualTo(15L);
          assertThat(polled.getValueSize()).isEqualTo(15L);
          assertThat(polled.getKeyFormat()).isEqualTo(MessageFormatDTO.AVRO);
          assertThat(polled.getValueFormat()).isEqualTo(MessageFormatDTO.AVRO);
          assertThat(polled.getKeySchemaId()).isNotEmpty();
          assertThat(polled.getValueSchemaId()).isNotEmpty();
        });
  }

  @Test
  void topicMessageMetadataProtobuf() {
    new SendAndReadSpec()
        .withKeySchema(PROTOBUF_SCHEMA)
        .withValueSchema(PROTOBUF_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(PROTOBUF_SCHEMA_JSON_RECORD)
                .content(PROTOBUF_SCHEMA_JSON_RECORD)
        )
        .doAssert(polled -> {
          assertJsonEqual(polled.getKey(), PROTOBUF_SCHEMA_JSON_RECORD);
          assertJsonEqual(polled.getContent(), PROTOBUF_SCHEMA_JSON_RECORD);
          assertThat(polled.getKeySize()).isEqualTo(18L);
          assertThat(polled.getValueSize()).isEqualTo(18L);
          assertThat(polled.getKeyFormat()).isEqualTo(MessageFormatDTO.PROTOBUF);
          assertThat(polled.getValueFormat()).isEqualTo(MessageFormatDTO.PROTOBUF);
          assertThat(polled.getKeySchemaId()).isNotEmpty();
          assertThat(polled.getValueSchemaId()).isNotEmpty();
        });
  }

  @Test
  void topicMessageMetadataJson() {
    new SendAndReadSpec()
        .withKeySchema(JSON_SCHEMA)
        .withValueSchema(JSON_SCHEMA)
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(JSON_SCHEMA_RECORD)
                .content(JSON_SCHEMA_RECORD)
                .headers(Map.of("header1", "value1"))
        )
        .doAssert(polled -> {
          assertJsonEqual(polled.getKey(), JSON_SCHEMA_RECORD);
          assertJsonEqual(polled.getContent(), JSON_SCHEMA_RECORD);
          assertThat(polled.getKeyFormat()).isEqualTo(MessageFormatDTO.JSON);
          assertThat(polled.getValueFormat()).isEqualTo(MessageFormatDTO.JSON);
          assertThat(polled.getKeySchemaId()).isNotEmpty();
          assertThat(polled.getValueSchemaId()).isNotEmpty();
          assertThat(polled.getKeySize()).isEqualTo(57L);
          assertThat(polled.getValueSize()).isEqualTo(57L);
          assertThat(polled.getHeadersSize()).isEqualTo(13L);
        });
  }

  @Test
  void noKeyAndNoContentPresentTest() {
    new SendAndReadSpec()
        .withMsgToSend(
            new CreateTopicMessageDTO()
                .key(null)
                .content(null)
        )
        .doAssert(polled -> {
          assertThat(polled.getKey()).isNull();
          assertThat(polled.getContent()).isNull();
        });
  }

  @SneakyThrows
  private void assertJsonEqual(String actual, String expected) {
    var mapper = new ObjectMapper();
    assertThat(mapper.readTree(actual)).isEqualTo(mapper.readTree(expected));
  }

  class SendAndReadSpec {
    CreateTopicMessageDTO msgToSend;
    ParsedSchema keySchema;
    ParsedSchema valueSchema;

    public SendAndReadSpec withMsgToSend(CreateTopicMessageDTO msg) {
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
    private String createTopicAndCreateSchemas() {
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

      return topic;
    }

    public void assertSendThrowsException() {
      String topic = createTopicAndCreateSchemas();
      try {
        StepVerifier.create(
            messagesService.sendMessage(targetCluster, topic, msgToSend)
        ).expectError().verify();
      } finally {
        deleteTopic(topic);
      }
    }

    @SneakyThrows
    public void doAssert(Consumer<TopicMessageDTO> msgAssert) {
      String topic = createTopicAndCreateSchemas();
      try {
        messagesService.sendMessage(targetCluster, topic, msgToSend).block();
        TopicMessageDTO polled = messagesService.loadMessages(
                targetCluster,
                topic,
                new ConsumerPosition(
                    SeekTypeDTO.BEGINNING,
                    Map.of(new TopicPartition(topic, 0), 0L),
                    SeekDirectionDTO.FORWARD
                ),
                null,
                null,
                1
            ).filter(e -> e.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE))
            .map(TopicMessageEventDTO::getMessage)
            .blockLast(Duration.ofSeconds(5000));

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
