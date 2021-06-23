package com.provectus.kafka.ui.serde;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.schemaregistry.SchemaRegistryRecordSerDe;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;
import reactor.util.function.Tuples;

class SchemaRegistryRecordDeserializerTest {

  private final SchemaRegistryRecordSerDe deserializer =
      new SchemaRegistryRecordSerDe(
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
    assertEquals(Tuples.of("key", value), deserializedRecord);
  }

  @Test
  public void shouldDeserializeNullValueRecordToEmptyMap() {
    var deserializedRecord = deserializer
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap("key".getBytes()), null));
    assertEquals(Tuples.of("key", Map.of()), deserializedRecord);
  }
}