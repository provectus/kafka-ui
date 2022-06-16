package com.provectus.kafka.ui.serde;

import static com.provectus.kafka.ui.serde.RecordSerDe.DeserializedKeyValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class SimpleRecordSerDeTest {

  private final SimpleRecordSerDe serde = new SimpleRecordSerDe();

  @Test
  public void shouldDeserializeStringValue() {
    var value = "test";
    var deserializedRecord = serde.deserialize(
        new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()),
            Bytes.wrap(value.getBytes())));
    DeserializedKeyValue expected = DeserializedKeyValue.builder()
        .key("key")
        .keyFormat(MessageFormat.UNKNOWN)
        .value(value)
        .valueFormat(MessageFormat.UNKNOWN)
        .build();
    assertEquals(expected, deserializedRecord);
  }

  @Test
  public void shouldDeserializeNullValueRecordToEmptyMap() {
    var deserializedRecord = serde
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()), null));
    DeserializedKeyValue expected = DeserializedKeyValue.builder()
        .key("key")
        .keyFormat(MessageFormat.UNKNOWN)
        .build();
    assertEquals(expected, deserializedRecord);
  }
}