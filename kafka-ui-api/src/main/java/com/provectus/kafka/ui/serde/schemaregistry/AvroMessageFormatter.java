package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import java.io.IOException;
import java.util.Map;
import lombok.SneakyThrows;
import org.apache.avro.generic.GenericRecord;

public class AvroMessageFormatter implements MessageFormatter {
  private final KafkaAvroDeserializer avroDeserializer;
  private final ObjectMapper objectMapper;

  public AvroMessageFormatter(SchemaRegistryClient client, ObjectMapper objectMapper) {
    this.avroDeserializer = new KafkaAvroDeserializer(client);
    this.objectMapper = objectMapper;
  }

  @Override
  @SneakyThrows
  public Object format(String topic, byte[] value) {
    if (value != null) {
      GenericRecord avroRecord = (GenericRecord) avroDeserializer.deserialize(topic, value);
      byte[] bytes = AvroSchemaUtils.toJson(avroRecord);
      return parseJson(bytes);
    } else {
      return Map.of();
    }
  }

  private Object parseJson(byte[] bytes) throws IOException {
    return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
    });
  }
}
