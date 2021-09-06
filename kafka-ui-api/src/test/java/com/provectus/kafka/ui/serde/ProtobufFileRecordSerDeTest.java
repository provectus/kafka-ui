package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProtobufFileRecordSerDeTest {

    // Two sample messages used here are generated using `address-book.proto` and contain a person with following email address
    public static final String TEST_USER_EMAIL = "user@example.com";
    // Sample message of type `test.Person`
    private final byte[] personMessage = Base64.getDecoder().decode("CgRVc2VyEGUaEHVzZXJAZXhhbXBsZS5jb20iCgoIMTEyMjMzNDQ=");
    // Sample message of type `test.AddressBook`
    private final byte[] addressBookMessage = Base64.getDecoder().decode("CAESJgoEVXNlchBlGhB1c2VyQGV4YW1wbGUuY29tIgoKCDExMjIzMzQ0");
    private static Path protobufSchema;

    @BeforeAll
    static void setUp() throws URISyntaxException {
        protobufSchema = Paths.get(ProtobufFileRecordSerDeTest.class.getClassLoader().getResource("address-book.proto").toURI());
    }

    @Test
    void testDeserialize() throws IOException {
        var messageNameMap = new HashMap<String, String>() {{
            put("topic1", "test.Person");
            put("topic2", "test.AddressBook");
        }};
        var deserializer = new ProtobufFileRecordSerDe(protobufSchema, messageNameMap, new ObjectMapper());
        var msg1 = deserializer.deserialize(new ConsumerRecord<>("topic1", 1, 0, Bytes.wrap("key".getBytes()),
                Bytes.wrap(personMessage)));
        assertEquals(MessageFormat.PROTOBUF, msg1.getValueFormat());
        assertTrue(msg1.getValue().contains(TEST_USER_EMAIL));

        var msg2 = deserializer.deserialize(new ConsumerRecord<>("topic2", 1, 1, Bytes.wrap("key".getBytes()),
                Bytes.wrap(addressBookMessage)));
        assertTrue(msg2.getValue().contains(TEST_USER_EMAIL));
    }

    @Test
    void testNoDefaultMessageName() throws IOException {
        // by default the first message type defined in proto definition is used
        var deserializer = new ProtobufFileRecordSerDe(protobufSchema, Collections.emptyMap(), new ObjectMapper());
        var msg = deserializer.deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()),
                Bytes.wrap(personMessage)));
        assertTrue(msg.getValue().contains(TEST_USER_EMAIL));
    }

    @Test
    void testDefaultMessageName() throws IOException {
        var messageNameMap = new HashMap<String, String>() {{
            put("topic1", "test.Person");
            put("_default", "test.AddressBook");
        }};
        var deserializer = new ProtobufFileRecordSerDe(protobufSchema, messageNameMap, new ObjectMapper());
        var msg = deserializer.deserialize(new ConsumerRecord<>("a_random_topic", 1, 0, Bytes.wrap("key".getBytes()),
                Bytes.wrap(addressBookMessage)));
        assertTrue(msg.getValue().contains(TEST_USER_EMAIL));
    }
}