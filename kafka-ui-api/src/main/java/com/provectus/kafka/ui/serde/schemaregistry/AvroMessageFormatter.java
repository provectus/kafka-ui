package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.util.JsonNodeUtil;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import lombok.SneakyThrows;
import org.apache.avro.generic.GenericRecord;

public class AvroMessageFormatter implements MessageFormatter {
  private final KafkaAvroDeserializer avroDeserializer;

  public AvroMessageFormatter(SchemaRegistryClient client) {
    this.avroDeserializer = new KafkaAvroDeserializer(client);
  }

  @Override
  @SneakyThrows
  public JsonNode format(String topic, byte[] value) {
    GenericRecord avroRecord = (GenericRecord) avroDeserializer.deserialize(topic, value);
    byte[] jsonBytes = AvroSchemaUtils.toJson(avroRecord);
    return JsonNodeUtil.toJsonNode(jsonBytes);
  }

  @Override
  public MessageFormat getFormat() {
    return MessageFormat.AVRO;
  }
}
