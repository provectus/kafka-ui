package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.api.Serde;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class ProtobufFileSerdeTest {

  private static final String samplePersonMsgJson =
      "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\", \"phones\":[] }";

  private static final String sampleBookMsgJson = "{\"version\": 1, \"people\": ["
      + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\", \"phones\":[]}]}";

  // Sample message of type `test.Person`
  private static byte[] personMessageBytes;
  // Sample message of type `test.AddressBook`
  private static byte[] addressBookMessageBytes;
  private static Path protobufSchemaPath;
  private static ProtobufSchema protobufSchema;

  @BeforeAll
  static void setUp() throws Exception {
    protobufSchemaPath = Paths.get(ProtobufFileSerdeTest.class.getClassLoader()
        .getResource("address-book.proto").toURI());
    protobufSchema = new ProtobufSchema(Files.readString(protobufSchemaPath));

    DynamicMessage.Builder builder = protobufSchema.newMessageBuilder("test.Person");
    JsonFormat.parser().merge(samplePersonMsgJson, builder);
    personMessageBytes = builder.build().toByteArray();

    builder = protobufSchema.newMessageBuilder("test.AddressBook");
    JsonFormat.parser().merge(sampleBookMsgJson, builder);
    addressBookMessageBytes = builder.build().toByteArray();
  }


  @Test
  void testDeserialize() {
    var messageNameMap = Map.of(
        "persons", protobufSchema.toDescriptor("test.Person"),
        "books", protobufSchema.toDescriptor("test.AddressBook")
    );
    var keyMessageNameMap = Map.of(
        "books", protobufSchema.toDescriptor("test.AddressBook"));

    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        null,
        null,
        messageNameMap,
        keyMessageNameMap
    );

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedBook = serde.deserializer("books", Serde.Target.KEY)
        .deserialize(null, addressBookMessageBytes);
    assertJsonEquals(sampleBookMsgJson, deserializedBook.getResult());
  }

  @Test
  void testDefaultMessageName() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        protobufSchema.toDescriptor("test.Person"),
        protobufSchema.toDescriptor("test.AddressBook"),
        Map.of(),
        Map.of()
    );

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedBook = serde.deserializer("books", Serde.Target.KEY)
        .deserialize(null, addressBookMessageBytes);
    assertJsonEquals(sampleBookMsgJson, deserializedBook.getResult());
  }


  @Test
  void testSerialize() {
    var messageNameMap = Map.of(
        "persons", protobufSchema.toDescriptor("test.Person"),
        "books", protobufSchema.toDescriptor("test.AddressBook")
    );
    var keyMessageNameMap = Map.of(
        "books", protobufSchema.toDescriptor("test.AddressBook"));

    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        null,
        null,
        messageNameMap,
        keyMessageNameMap
    );

    var personBytes = serde.serializer("persons", Serde.Target.VALUE)
        .serialize("{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }");
    assertThat(personBytes).isEqualTo(personMessageBytes);

    var booksBytes = serde.serializer("books", Serde.Target.KEY)
        .serialize("{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\" }]}");
    assertThat(booksBytes).isEqualTo(addressBookMessageBytes);
  }

  @Test
  void testSerializeDefaults() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        protobufSchemaPath,
        protobufSchema.toDescriptor("test.Person"),
        protobufSchema.toDescriptor("test.AddressBook"),
        Map.of(),
        Map.of()
    );

    var personBytes = serde.serializer("persons", Serde.Target.VALUE)
        .serialize("{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\" }");
    assertThat(personBytes).isEqualTo(personMessageBytes);

    var booksBytes = serde.serializer("books", Serde.Target.KEY)
        .serialize("{\"version\": 1, \"people\": ["
            + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\" }]}");
    assertThat(booksBytes).isEqualTo(addressBookMessageBytes);
  }

  @SneakyThrows
  private void assertJsonEquals(String expectedJson, String actualJson) {
    var mapper = new JsonMapper();
    assertThat(mapper.readTree(actualJson)).isEqualTo(mapper.readTree(expectedJson));
  }

}