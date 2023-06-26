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
import com.provectus.kafka.ui.serdes.builtin.ProtobufFileSerde.Configuration;
import com.squareup.wire.schema.ProtoFile;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.util.ResourceUtils;

class ProtobufFileSerdeTest {

  private static final String samplePersonMsgJson =
      "{ \"name\": \"My Name\",\"id\": 101, \"email\": \"user1@example.com\", \"phones\":[] }";

  private static final String sampleBookMsgJson = "{\"version\": 1, \"people\": ["
      + "{ \"name\": \"My Name\",\"id\": 102, \"email\": \"addrBook@example.com\", \"phones\":[]}]}";

  private static final String sampleLangDescriptionMsgJson = "{ \"lang\": \"EN\", "
      + "\"descr\": \"Some description here\" }";

  // Sample message of type `test.Person`
  private byte[] personMessageBytes;
  // Sample message of type `test.AddressBook`
  private byte[] addressBookMessageBytes;
  private byte[] langDescriptionMessageBytes;
  private Descriptors.Descriptor personDescriptor;
  private Descriptors.Descriptor addressBookDescriptor;
  private Descriptors.Descriptor langDescriptionDescriptor;
  private Map<Descriptors.Descriptor, Path> descriptorPaths;

  @BeforeEach
  void setUp() throws Exception {
    Map<Path, ProtobufSchema> files = ProtobufFileSerde.Configuration.loadSchemas(
        Optional.empty(),
        Optional.of(protoFilesDir())
    );

    Path addressBookSchemaPath = ResourceUtils.getFile("classpath:protobuf-serde/address-book.proto").toPath();
    var addressBookSchema = files.get(addressBookSchemaPath);
    var builder = addressBookSchema.newMessageBuilder("test.Person");
    JsonFormat.parser().merge(samplePersonMsgJson, builder);
    personMessageBytes = builder.build().toByteArray();

    builder = addressBookSchema.newMessageBuilder("test.AddressBook");
    JsonFormat.parser().merge(sampleBookMsgJson, builder);
    addressBookMessageBytes = builder.build().toByteArray();
    personDescriptor = addressBookSchema.toDescriptor("test.Person");
    addressBookDescriptor = addressBookSchema.toDescriptor("test.AddressBook");

    Path languageDescriptionPath = ResourceUtils.getFile("classpath:protobuf-serde/lang-description.proto").toPath();
    var languageDescriptionSchema = files.get(languageDescriptionPath);
    builder = languageDescriptionSchema.newMessageBuilder("test.LanguageDescription");
    JsonFormat.parser().merge(sampleLangDescriptionMsgJson, builder);
    langDescriptionMessageBytes = builder.build().toByteArray();
    langDescriptionDescriptor = languageDescriptionSchema.toDescriptor("test.LanguageDescription");

    descriptorPaths = Map.of(
        personDescriptor, addressBookSchemaPath,
        addressBookDescriptor, addressBookSchemaPath
    );
  }

  @Test
  void loadsAllProtoFiledFromTargetDirectory() throws Exception {
    var protoDir = ResourceUtils.getFile("classpath:protobuf-serde/").getPath();
    List<ProtoFile> files = new ProtobufFileSerde.ProtoSchemaLoader(protoDir).load();
    assertThat(files).hasSize(4);
    assertThat(files)
        .map(f -> f.getLocation().getPath())
        .containsExactlyInAnyOrder(
            "language/language.proto",
            "sensor.proto",
            "address-book.proto",
            "lang-description.proto"
        );
  }

  @SneakyThrows
  private String protoFilesDir() {
    return ResourceUtils.getFile("classpath:protobuf-serde/").getPath();
  }

  @Nested
  class ConfigurationTests {

    @Test
    void canBeAutoConfiguredReturnsNoProtoPropertiesProvided() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      assertThat(Configuration.canBeAutoConfigured(resolver))
          .isFalse();
    }

    @Test
    void canBeAutoConfiguredReturnsTrueIfProtoFilesHasBeenProvided() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getListProperty("protobufFiles", String.class))
          .thenReturn(Optional.of(List.of("file.proto")));
      assertThat(Configuration.canBeAutoConfigured(resolver))
          .isTrue();
    }

    @Test
    void canBeAutoConfiguredReturnsTrueIfProtoFilesDirProvided() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of("/filesDir"));
      assertThat(Configuration.canBeAutoConfigured(resolver))
          .isTrue();
    }

    @Test
    void unknownSchemaAsDefaultThrowsException() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of(protoFilesDir()));

      when(resolver.getProperty("protobufMessageName", String.class))
          .thenReturn(Optional.of("test.NotExistent"));

      assertThatThrownBy(() -> Configuration.create(resolver))
          .isInstanceOf(NullPointerException.class)
          .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
    }

    @Test
    void unknownSchemaAsDefaultForKeyThrowsException() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of(protoFilesDir()));

      when(resolver.getProperty("protobufMessageNameForKey", String.class))
          .thenReturn(Optional.of("test.NotExistent"));

      assertThatThrownBy(() -> Configuration.create(resolver))
          .isInstanceOf(NullPointerException.class)
          .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
    }

    @Test
    void unknownSchemaAsTopicSchemaThrowsException() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of(protoFilesDir()));

      when(resolver.getMapProperty("protobufMessageNameByTopic", String.class, String.class))
          .thenReturn(Optional.of(Map.of("persons", "test.NotExistent")));

      assertThatThrownBy(() -> Configuration.create(resolver))
          .isInstanceOf(NullPointerException.class)
          .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
    }

    @Test
    void unknownSchemaAsTopicSchemaForKeyThrowsException() {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of(protoFilesDir()));

      when(resolver.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class))
          .thenReturn(Optional.of(Map.of("persons", "test.NotExistent")));

      assertThatThrownBy(() -> Configuration.create(resolver))
          .isInstanceOf(NullPointerException.class)
          .hasMessage("The given message type not found in protobuf definition: test.NotExistent");
    }

    @Test
    void createConfigureFillsDescriptorMappingsWhenProtoFilesListProvided() throws Exception {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getListProperty("protobufFiles", String.class))
          .thenReturn(Optional.of(
              List.of(
                  ResourceUtils.getFile("classpath:protobuf-serde/sensor.proto").getPath(),
                  ResourceUtils.getFile("classpath:protobuf-serde/address-book.proto").getPath())));

      when(resolver.getProperty("protobufMessageName", String.class))
          .thenReturn(Optional.of("test.Sensor"));

      when(resolver.getProperty("protobufMessageNameForKey", String.class))
          .thenReturn(Optional.of("test.AddressBook"));

      when(resolver.getMapProperty("protobufMessageNameByTopic", String.class, String.class))
          .thenReturn(Optional.of(
              Map.of(
                  "topic1", "test.Sensor",
                  "topic2", "test.AddressBook")));

      when(resolver.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class))
          .thenReturn(Optional.of(
              Map.of(
                  "topic1", "test.Person",
                  "topic2", "test.AnotherPerson")));

      var configuration = Configuration.create(resolver);

      assertThat(configuration.defaultMessageDescriptor())
          .matches(d -> d.getFullName().equals("test.Sensor"));
      assertThat(configuration.defaultKeyMessageDescriptor())
          .matches(d -> d.getFullName().equals("test.AddressBook"));

      assertThat(configuration.messageDescriptorMap())
          .containsOnlyKeys("topic1", "topic2")
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.Sensor"))
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.AddressBook"));

      assertThat(configuration.keyMessageDescriptorMap())
          .containsOnlyKeys("topic1", "topic2")
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.Person"))
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.AnotherPerson"));
    }

    @Test
    void createConfigureFillsDescriptorMappingsWhenProtoFileDirProvided() throws Exception {
      PropertyResolver resolver = mock(PropertyResolver.class);
      when(resolver.getProperty("protobufFilesDir", String.class))
          .thenReturn(Optional.of(protoFilesDir()));

      when(resolver.getProperty("protobufMessageName", String.class))
          .thenReturn(Optional.of("test.Sensor"));

      when(resolver.getProperty("protobufMessageNameForKey", String.class))
          .thenReturn(Optional.of("test.AddressBook"));

      when(resolver.getMapProperty("protobufMessageNameByTopic", String.class, String.class))
          .thenReturn(Optional.of(
              Map.of(
                  "topic1", "test.Sensor",
                  "topic2", "test.LanguageDescription")));

      when(resolver.getMapProperty("protobufMessageNameForKeyByTopic", String.class, String.class))
          .thenReturn(Optional.of(
              Map.of(
                  "topic1", "test.Person",
                  "topic2", "test.AnotherPerson")));

      var configuration = Configuration.create(resolver);

      assertThat(configuration.defaultMessageDescriptor())
          .matches(d -> d.getFullName().equals("test.Sensor"));
      assertThat(configuration.defaultKeyMessageDescriptor())
          .matches(d -> d.getFullName().equals("test.AddressBook"));

      assertThat(configuration.messageDescriptorMap())
          .containsOnlyKeys("topic1", "topic2")
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.Sensor"))
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.LanguageDescription"));

      assertThat(configuration.keyMessageDescriptorMap())
          .containsOnlyKeys("topic1", "topic2")
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.Person"))
          .anySatisfy((topic, descr) -> assertThat(descr.getFullName()).isEqualTo("test.AnotherPerson"));
    }
  }

  @Test
  void deserializeUsesTopicsMappingToFindMsgDescriptor() {
    var messageNameMap = Map.of(
        "persons", personDescriptor,
        "books", addressBookDescriptor,
        "langs", langDescriptionDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);
    var serde = new ProtobufFileSerde();
    serde.configure(
        new Configuration(
            null,
            null,
            descriptorPaths,
            messageNameMap,
            keyMessageNameMap
        )
    );

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedBook = serde.deserializer("books", Serde.Target.KEY)
        .deserialize(null, addressBookMessageBytes);
    assertJsonEquals(sampleBookMsgJson, deserializedBook.getResult());

    var deserializedSensor = serde.deserializer("langs", Serde.Target.VALUE)
        .deserialize(null, langDescriptionMessageBytes);
    assertJsonEquals(sampleLangDescriptionMsgJson, deserializedSensor.getResult());
  }

  @Test
  void deserializeUsesDefaultDescriptorIfTopicMappingNotFound() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        new Configuration(
            personDescriptor,
            addressBookDescriptor,
            descriptorPaths,
            Map.of(),
            Map.of()
        )
    );

    var deserializedPerson = serde.deserializer("persons", Serde.Target.VALUE)
        .deserialize(null, personMessageBytes);
    assertJsonEquals(samplePersonMsgJson, deserializedPerson.getResult());

    var deserializedBook = serde.deserializer("books", Serde.Target.KEY)
        .deserialize(null, addressBookMessageBytes);
    assertJsonEquals(sampleBookMsgJson, deserializedBook.getResult());
  }

  @Test
  void serializeUsesTopicsMappingToFindMsgDescriptor() {
    var messageNameMap = Map.of(
        "persons", personDescriptor,
        "books", addressBookDescriptor,
        "langs", langDescriptionDescriptor
    );
    var keyMessageNameMap = Map.of(
        "books", addressBookDescriptor);

    var serde = new ProtobufFileSerde();
    serde.configure(
        new Configuration(
            null,
            null,
            descriptorPaths,
            messageNameMap,
            keyMessageNameMap
        )
    );

    var personBytes = serde.serializer("langs", Serde.Target.VALUE)
        .serialize(sampleLangDescriptionMsgJson);
    assertThat(personBytes).isEqualTo(langDescriptionMessageBytes);

    var booksBytes = serde.serializer("books", Serde.Target.KEY)
        .serialize(sampleBookMsgJson);
    assertThat(booksBytes).isEqualTo(addressBookMessageBytes);
  }

  @Test
  void serializeUsesDefaultDescriptorIfTopicMappingNotFound() {
    var serde = new ProtobufFileSerde();
    serde.configure(
        new Configuration(
            personDescriptor,
            addressBookDescriptor,
            descriptorPaths,
            Map.of(),
            Map.of()
        )
    );

    var personBytes = serde.serializer("persons", Serde.Target.VALUE)
        .serialize(samplePersonMsgJson);
    assertThat(personBytes).isEqualTo(personMessageBytes);

    var booksBytes = serde.serializer("books", Serde.Target.KEY)
        .serialize(sampleBookMsgJson);
    assertThat(booksBytes).isEqualTo(addressBookMessageBytes);
  }

  @SneakyThrows
  private void assertJsonEquals(String expectedJson, String actualJson) {
    var mapper = new JsonMapper();
    assertThat(mapper.readTree(actualJson)).isEqualTo(mapper.readTree(expectedJson));
  }
}
