package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.api.Serde;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class ProtobufFileSerdeTest {

  // Sample message of type `test.Person`
  private static byte[] personMessage;
  // Sample message of type `test.AddressBook`
  private static byte[] addressBookMessage;
  private static Path protobufSchemaPath;
  private static ProtobufSchema protobufSchema;

  @BeforeAll
  static void setUp() throws Exception {
    protobufSchemaPath = Paths.get(ProtobufFileSerdeTest.class.getClassLoader()
        .getResource("address-book.proto").toURI());
    protobufSchema = new ProtobufSchema(Files.readString(protobufSchemaPath));

    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder("test.Person");
    JsonFormat.parser().merge(
        "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }", builder);
    personMessage = builder.build().toByteArray();

    builder = protobufSchema.newMessageBuilder("test.AddressBook");
    JsonFormat.parser().merge(
        "{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\" }]}", builder);
    addressBookMessage = builder.build().toByteArray();
  }


  @Test
  void testDeserialize() throws IOException {
    var messageNameMap = Map.of(
        "topic1", protobufSchema.toDescriptor("test.Person"),
        "topic2", protobufSchema.toDescriptor("test.AddressBook")
    );
    var keyMessageNameMap = Map.of(
        "topic2", protobufSchema.toDescriptor("test.AddressBook"));

    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        null,
        null,
        messageNameMap,
        keyMessageNameMap
    );

    var msg1 = serde.deserializer("topic1", Serde.Type.VALUE)
        .deserialize("topic1", null, personMessage);
    assertThat(msg1.getResult().contains("user1@example.com")).isTrue();

    var msg2 = serde.deserializer("topic2", Serde.Type.KEY)
        .deserialize("topic2", null, addressBookMessage);
    assertThat(msg2.getResult().contains("addrBook@example.com")).isTrue();
  }

  @Test
  void testDefaultMessageName() throws IOException {
    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        protobufSchema.toDescriptor("test.Person"),
        protobufSchema.toDescriptor("test.AddressBook"),
        Map.of(),
        Map.of()
    );

    var msg1 = serde.deserializer("topic1", Serde.Type.VALUE)
        .deserialize("topic1", null, personMessage);
    assertThat(msg1.getResult().contains("user1@example.com")).isTrue();

    var msg2 = serde.deserializer("topic2", Serde.Type.KEY)
        .deserialize("topic1", null, addressBookMessage);
    assertThat(msg2.getResult().contains("addrBook@example.com")).isTrue();
  }


  @Test
  void testSerialize() throws IOException {
    var messageNameMap = Map.of(
        "topic1", protobufSchema.toDescriptor("test.Person"),
        "topic2", protobufSchema.toDescriptor("test.AddressBook")
    );
    var keyMessageNameMap = Map.of(
        "topic2", protobufSchema.toDescriptor("test.AddressBook"));

    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        null,
        null,
        messageNameMap,
        keyMessageNameMap
    );

    var personBytes = serde.serializer("topic1", Serde.Type.VALUE)
        .serialize("topic1", "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }");
    assertThat(personBytes).isEqualTo(personBytes);

    var booksBytes = serde.serializer("topic2", Serde.Type.KEY)
        .serialize("topic1", "{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\" }]}");
    assertThat(booksBytes).isEqualTo(addressBookMessage);
  }

  @Test
  void testSerializeDefaults() throws IOException {
    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        protobufSchema.toDescriptor("test.Person"),
        protobufSchema.toDescriptor("test.AddressBook"),
        Map.of(),
        Map.of()
    );

    var personBytes = serde.serializer("topic1", Serde.Type.VALUE)
        .serialize("topic1", "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }");
    assertThat(personBytes).isEqualTo(personBytes);

    var booksBytes = serde.serializer("topic2", Serde.Type.KEY)
        .serialize("topic1", "{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\" }]}");
    assertThat(booksBytes).isEqualTo(addressBookMessage);
  }

}