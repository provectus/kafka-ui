package com.provectus.kafka.ui.deserialization;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class SchemaRegistryRecordDeserializerTest {

  private final SchemaRegistryRecordDeserializer deserializer =
      new SchemaRegistryRecordDeserializer(
          KafkaCluster.builder()
              .schemaNameTemplate("%s-value")
              .build(),
          new ObjectMapper()
      );

  @Test
  public void shouldDeserializeStringValue() {
    var value = "test";
    var deserializedRecord = deserializer.deserialize(
        new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()),
            Bytes.wrap(value.getBytes())));
    assertEquals(value, deserializedRecord);
  }

  @Test
  public void shouldDeserializeNullValueRecordToEmptyMap() {
    var deserializedRecord = deserializer
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()), null));
    assertEquals(Map.of(), deserializedRecord);
  }
}