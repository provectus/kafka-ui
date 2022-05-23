package com.provectus.kafka.ui.serde;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class ProtobufFileRecordSerDeTest {

  // Sample message of type `test.Person`
  private static byte[] personMessage;
  // Sample message of type `test.AddressBook`
  private static byte[] addressBookMessage;
  private static Path protobufSchemaPath;

  @BeforeAll
  static void setUp() throws URISyntaxException, IOException {
    protobufSchemaPath = Paths.get(ProtobufFileRecordSerDeTest.class.getClassLoader()
        .getResource("address-book.proto").toURI());
    ProtobufSchema protobufSchema = new ProtobufSchema(Files.readString(protobufSchemaPath));

    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder("test.Person");
    JsonFormat.parser().merge(
        "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }", builder);
    personMessage = builder.build().toByteArray();

    builder = protobufSchema.newMessageBuilder("test.AddressBook");
    JsonFormat.parser().merge(
        "{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"user2@example.com\" }]}", builder);
    addressBookMessage = builder.build().toByteArray();
  }

  @Test
  void testDeserialize() throws IOException {
    var messageNameMap = Map.of(
        "topic1", "test.Person",
        "topic2", "test.AddressBook");
    var keyMessageNameMap = Map.of(
        "topic2", "test.Person");
    var deserializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, messageNameMap, keyMessageNameMap, null, null);
    var msg1 = deserializer
        .deserialize(new ConsumerRecord<>("topic1", 1, 0, Bytes.wrap("key".getBytes()),
            Bytes.wrap(personMessage)));
    assertEquals(MessageFormat.PROTOBUF, msg1.getValueFormat());
    assertTrue(msg1.getValue().contains("user1@example.com"));

    var msg2 = deserializer
        .deserialize(new ConsumerRecord<>("topic2", 1, 1, Bytes.wrap(personMessage),
            Bytes.wrap(addressBookMessage)));
    assertEquals(MessageFormat.PROTOBUF, msg2.getKeyFormat());
    assertTrue(msg2.getKey().contains("user1@example.com"));
    assertTrue(msg2.getValue().contains("user2@example.com"));
  }

  @Test
  void testNoDefaultMessageName() throws IOException {
    // by default the first message type defined in proto definition is used
    var deserializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, Collections.emptyMap(), null, null, null);
    var msg = deserializer
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()),
            Bytes.wrap(personMessage)));
    assertTrue(msg.getValue().contains("user1@example.com"));
  }

  @Test
  void testDefaultMessageName() throws IOException {
    var messageNameMap = Map.of("topic1", "test.Person");
    var deserializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, messageNameMap, null, "test.AddressBook", null);
    var msg = deserializer
        .deserialize(new ConsumerRecord<>("a_random_topic", 1, 0, Bytes.wrap(addressBookMessage),
            Bytes.wrap(addressBookMessage)));
    assertTrue(msg.getValue().contains("user2@example.com"));
  }

  @Test
  void testDefaultKeyMessageName() throws IOException {
    var messageNameMap = Map.of("topic1", "test.Person");
    var deserializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, messageNameMap, messageNameMap, "test.AddressBook",
            "test.AddressBook");
    var msg = deserializer
        .deserialize(new ConsumerRecord<>("a_random_topic", 1, 0, Bytes.wrap(addressBookMessage),
            Bytes.wrap(addressBookMessage)));
    assertTrue(msg.getKey().contains("user2@example.com"));
  }

  @Test
  void testSerialize() throws IOException {
    var messageNameMap = Map.of("topic1", "test.Person");
    var serializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, messageNameMap, null, "test.AddressBook", null);
    var serialized = serializer.serialize("topic1", "key1", "{\"name\":\"MyName\"}", 0);
    assertNotNull(serialized.value());
  }

  @Test
  void testSerializeKeyAndValue() throws IOException {
    var messageNameMap = Map.of("topic1", "test.Person");
    var serializer =
        new ProtobufFileRecordSerDe(protobufSchemaPath, messageNameMap, messageNameMap, "test.AddressBook",
                "test.AddressBook");
    var serialized = serializer.serialize("topic1", "{\"name\":\"MyName\"}", "{\"name\":\"MyName\"}", 0);
    assertNotNull(serialized.key());
    assertNotNull(serialized.value());
  }
}
