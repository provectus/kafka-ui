package com.provectus.kafka.ui.serdes.builtin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.google.protobuf.Descriptors;
import com.google.protobuf.util.JsonFormat;
import com.provectus.kafka.ui.serde.api.PropertyResolver;
import com.provectus.kafka.ui.serde.api.Serde;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.ResourceUtils;

class ProtobufFileSerdeTest {

  private static final String samplePersonMsgJson =
      "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\", \"phones\":[] }";

  private static final String sampleBookMsgJson = "{\"version\": 1, \"people\": ["
      + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\", \"phones\":[]}]}";

  private static final String sampleSensorMsgJson = "{ \"name\": \"My Sensor\", "
      + "\"temperature\": 20.5, \"humidity\": 50, \"door\": \"OPEN\" }";

  // Sample message of type `test.Person`
  private byte[] personMessageBytes;
  // Sample message of type `test.AddressBook`
  private byte[] addressBookMessageBytes;
  private byte[] sensorMessageBytes;
  private Path addressBookSchemaPath;
  private Path sensorSchemaPath;

  private Descriptors.Descriptor personDescriptor;
  private Descriptors.Descriptor addressBookDescriptor;
  private Descriptors.Descriptor sensorDescriptor;
  private Map<Descriptors.Descriptor, Path> descriptorPaths;

  @BeforeEach
  void setUp() throws Exception {
    addressBookSchemaPath = ResourceUtils.getFile("classpath:address-book.proto").toPath();
    sensorSchemaPath = ResourceUtils.getFile("classpath:sensor.proto").toPath();

    ProtobufSchema addressBookSchema = new ProtobufSchema(Files.readString(addressBookSchemaPath));
    var builder = addressBookSchema.newMessageBuilder("test.Person");
    JsonFormat.parser().merge(samplePersonMsgJson, builder);
    personMessageBytes = builder.build().toByteArray();

    builder = addressBookSchema.newMessageBuilder("test.AddressBook");
    JsonFormat.parser().merge(sampleBookMsgJson, builder);
    addressBookMessageBytes = builder.build().toByteArray();
    personDescriptor = addressBookSchema.toDescriptor("test.Person");
    addressBookDescriptor = addressBookSchema.toDescriptor("test.AddressBook");

    ProtobufSchema sensorSchema = new ProtobufSchema(Files.readString(sensorSchemaPath));
    builder = sensorSchema.newMessageBuilder("iot.Sensor");
    JsonFormat.parser().merge(sampleSensorMsgJson, builder);
    sensorMessageBytes = builder.build().toByteArray();
    sensorDescriptor = sensorSchema.toDescriptor("iot.Sensor");

    descriptorPaths = Map.of(
        personDescriptor, addressBookSchemaPath,
        addressBookDescriptor, addressBookSchemaPath,
        sensorDescriptor, sensorSchemaPath
    );
  }


  @Test
  void testDeserialize() {
    var messageNameMap = Map.of(
        "persons", personDescriptor,
        "books", addressBookDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);

    var serde = new ProtobufFileSerde();
    serde.configure(
        null,
        null,
        descriptorPaths,
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
  void testDeserializeMultipleProtobuf() {
    var messageNameMap = Map.of(
        "persons", personDescriptor,
        "books", addressBookDescriptor,
        "sensors", sensorDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);
    var serde = new ProtobufFileSerde();
    serde.configure(
        null,
        null,
        descriptorPaths,
        messageNameMap,
        keyMessageNameMap
    );

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedBook = serde.deserializer("books", Serde.Target.KEY)
        .deserialize(null, addressBookMessageBytes);
    assertJsonEquals(sampleBookMsgJson, deserializedBook.getResult());

    var deserializedSensor = serde.deserializer("sensors", Serde.Target.VALUE)
        .deserialize(null, sensorMessageBytes);
    assertJsonEquals(sampleSensorMsgJson, deserializedSensor.getResult());
  }

  @Test
  void testDefaultMessageName() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        personDescriptor,
        addressBookDescriptor,
        descriptorPaths,
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
        "persons", personDescriptor,
        "books", addressBookDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);

    var serde = new ProtobufFileSerde();
    serde.configure(
        null,
        null,
        descriptorPaths,
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
  void testSerializeMultipleProtobuf() {
    var messageNameMap = Map.of(
        "persons", personDescriptor,
        "books", addressBookDescriptor,
        "sensors", sensorDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);

    var serde = new ProtobufFileSerde();
    serde.configure(
        null,
        null,
        descriptorPaths,
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

    var sensorBytes = serde.serializer("sensors", Serde.Target.VALUE)
        .serialize("{ \"name\": \"My Sensor\", \"temperature\": 20.5, \"humidity\": 50, \"door\": \"OPEN\" }");
    assertThat(sensorBytes).isEqualTo(sensorMessageBytes);
  }

  @Test
  void testSerializeDefaults() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        personDescriptor,
        addressBookDescriptor,
        descriptorPaths,
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

  @Test
  void initOnStartupReturnsFalseIfNoProtoFilesHaveBeenProvided() {
    PropertyResolver resolver = mock(PropertyResolver.class);

    var serde = new ProtobufFileSerde();
    boolean startupSuccessful = serde.initOnStartup(resolver, resolver);
    assertThat(startupSuccessful).isFalse();
  }

  @Test
  void initOnStartupReturnsFalseIfProtoFilesListIsEmpty() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class)).thenReturn(Optional.of(List.of()));

    var serde = new ProtobufFileSerde();
    boolean startupSuccessful = serde.initOnStartup(resolver, resolver);
    assertThat(startupSuccessful).isFalse();
  }

  @Test
  void initOnStartupReturnsTrueIfNoProtoFileHasBeenProvided() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getProperty("protobufFile", String.class)).thenReturn(Optional.of("file.proto"));

    var serde = new ProtobufFileSerde();
    boolean startupSuccessful = serde.initOnStartup(resolver, resolver);
    assertThat(startupSuccessful).isTrue();
  }

  @Test
  void initOnStartupReturnsTrueIfProtoFilesHasBeenProvided() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class)).thenReturn(Optional.of(List.of("file.proto")));

    var serde = new ProtobufFileSerde();
    boolean startupSuccessful = serde.initOnStartup(resolver, resolver);
    assertThat(startupSuccessful).isTrue();
  }

  @Test
  void initOnStartupReturnsTrueIfProtoFileAndProtoFilesHaveBeenProvided() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getProperty("protobufFile", String.class)).thenReturn(Optional.of("file1.proto"));
    when(resolver.getListProperty("protobufFiles", String.class)).thenReturn(Optional.of(List.of("file2.proto")));

    var serde = new ProtobufFileSerde();
    boolean startupSuccessful = serde.initOnStartup(resolver, resolver);
    assertThat(startupSuccessful).isTrue();
  }

  @Test
  void listOfProtobufFilesIsJoined() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getProperty("protobufFile", String.class))
        .thenReturn(Optional.of(addressBookSchemaPath.toString()));
    when(resolver.getListProperty("protobufFiles", String.class))
        .thenReturn(Optional.of(List.of(sensorSchemaPath.toString())));
    when(resolver.getProperty("protobufMessageName", String.class))
        .thenReturn(Optional.of("test.AddressBook"));

    Map<String, String> protobufMessageNameByTopic = Map.of(
        "persons", "test.Person",
        "books", "test.AddressBook",
        "sensors", "iot.Sensor");
    when(resolver.getMapProperty("protobufMessageNameByTopic", String.class, String.class))
        .thenReturn(Optional.of(protobufMessageNameByTopic));

    var serde = new ProtobufFileSerde();
    serde.configure(resolver, resolver, resolver);

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedSensor = serde.deserializer("sensors", Serde.Target.VALUE)
        .deserialize(null, sensorMessageBytes);
    assertJsonEquals(sampleSensorMsgJson, deserializedSensor.getResult());
  }

  @Test
  void unknownSchemaAsDefaultThrowsException() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class))
        .thenReturn(Optional.of(List.of(addressBookSchemaPath.toString(), sensorSchemaPath.toString())));
    when(resolver.getProperty("protobufMessageName", String.class))
        .thenReturn(Optional.of("test.NotExistent"));

    var serde = new ProtobufFileSerde();
    assertThatThrownBy(() -> serde.configure(resolver, resolver, resolver))
        .isInstanceOf(NullPointerException.class)
        .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
  }

  @Test
  void unknownSchemaAsDefaultForKeyThrowsException() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class))
        .thenReturn(Optional.of(List.of(addressBookSchemaPath.toString(), sensorSchemaPath.toString())));
    when(resolver.getProperty("protobufMessageName", String.class))
        .thenReturn(Optional.of("test.AddressBook"));
    when(resolver.getProperty("protobufMessageNameForKey", String.class))
        .thenReturn(Optional.of("test.NotExistent"));

    var serde = new ProtobufFileSerde();
    assertThatThrownBy(() -> serde.configure(resolver, resolver, resolver))
        .isInstanceOf(NullPointerException.class)
        .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
  }

  @Test
  void unknownSchemaAsTopicSchemaThrowsException() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class))
        .thenReturn(Optional.of(List.of(addressBookSchemaPath.toString(), sensorSchemaPath.toString())));
    when(resolver.getProperty("protobufMessageName", String.class))
        .thenReturn(Optional.of("test.AddressBook"));

    when(resolver.getMapProperty("protobufMessageNameByTopic", String.class, String.class))
        .thenReturn(Optional.of(Map.of("persons", "test.NotExistent")));

    var serde = new ProtobufFileSerde();
    assertThatThrownBy(() -> serde.configure(resolver, resolver, resolver))
        .isInstanceOf(NullPointerException.class)
        .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
  }

  @Test
  void unknownSchemaAsTopicSchemaForKeyThrowsException() {
    PropertyResolver resolver = mock(PropertyResolver.class);
    when(resolver.getListProperty("protobufFiles", String.class))
        .thenReturn(Optional.of(List.of(addressBookSchemaPath.toString(), sensorSchemaPath.toString())));
    when(resolver.getProperty("protobufMessageName", String.class))
        .thenReturn(Optional.of("test.AddressBook"));

    when(resolver.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class))
        .thenReturn(Optional.of(Map.of("persons", "test.NotExistent")));

    var serde = new ProtobufFileSerde();
    assertThatThrownBy(() -> serde.configure(resolver, resolver, resolver))
        .isInstanceOf(NullPointerException.class)
        .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
  }

  @SneakyThrows
  private void assertJsonEquals(String expectedJson, String actualJson) {
    var mapper = new JsonMapper();
    assertThat(mapper.readTree(actualJson)).isEqualTo(mapper.readTree(expectedJson));
  }
}
