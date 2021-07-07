package com.provectus.kafka.ui.serde;

import static com.provectus.kafka.ui.serde.RecordSerDe.DeserializedKeyValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.schemaregistry.SchemaRegistryAwareRecordSerDe;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class SchemaRegistryRecordDeserializerTest {

  private final SchemaRegistryAwareRecordSerDe deserializer =
      new SchemaRegistryAwareRecordSerDe(
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
    assertEquals(new DeserializedKeyValue("key", value), deserializedRecord);
  }

  @Test
  public void shouldDeserializeNullValueRecordToEmptyMap() {
    var deserializedRecord = deserializer
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()), null));
    assertEquals(new DeserializedKeyValue("key", null), deserializedRecord);
  }
}