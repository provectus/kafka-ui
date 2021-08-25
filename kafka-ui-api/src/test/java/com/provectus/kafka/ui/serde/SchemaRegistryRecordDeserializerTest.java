package com.provectus.kafka.ui.serde;

import static com.provectus.kafka.ui.serde.RecordSerDe.DeserializedKeyValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import com.provectus.kafka.ui.serde.schemaregistry.SchemaRegistryAwareRecordSerDe;
import com.provectus.kafka.ui.util.JsonNodeUtil;
import java.nio.charset.StandardCharsets;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class SchemaRegistryRecordDeserializerTest {
  private ObjectMapper objectMapper = new ObjectMapper();

  private final SchemaRegistryAwareRecordSerDe deserializer =
      new SchemaRegistryAwareRecordSerDe(
          KafkaCluster.builder()
              .schemaNameTemplate("%s-value")
              .build()
      );

  @Test
  @SneakyThrows
  public void shouldDeserializeStringValue() {
    var value = "test";
    var key = "key";
    var deserializedRecord = deserializer.deserialize(
        new ConsumerRecord<>("topic", 1, 0, Bytes.wrap(key.getBytes()),
            Bytes.wrap(value.getBytes())));
    DeserializedKeyValue expected = DeserializedKeyValue.builder()
        .key(JsonNodeUtil.toJsonNode(key.getBytes()))
        .keyFormat(MessageFormat.UNKNOWN)
        .value(JsonNodeUtil.toJsonNode(value.getBytes()))
        .valueFormat(MessageFormat.UNKNOWN)
        .build();
    assertEquals(expected, deserializedRecord);
  }

  @Test
  @SneakyThrows
  public void shouldDeserializeNullValueRecordToEmptyMap() {
    var key = "key";
    var deserializedRecord = deserializer
        .deserialize(new ConsumerRecord<>("topic", 1, 0, Bytes.wrap(key.getBytes()), null));
    DeserializedKeyValue expected = DeserializedKeyValue.builder()
        .key(JsonNodeUtil.toJsonNode(key.getBytes()))
        .keyFormat(MessageFormat.UNKNOWN)
        .build();
    assertEquals(expected, deserializedRecord);
  }
}
