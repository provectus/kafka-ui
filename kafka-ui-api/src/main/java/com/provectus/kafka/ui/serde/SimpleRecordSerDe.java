package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import com.provectus.kafka.ui.util.ConsumerRecordUtil;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordSerDe implements RecordSerDe {

  private static final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    var builder = DeserializedKeyValue.builder();
    if (msg.key() != null) {
      builder.key(new String(msg.key().get()))
          .keyFormat(MessageFormat.UNKNOWN);
    }
    if (msg.value() != null) {
      builder.value(new String(msg.value().get()))
          .valueFormat(MessageFormat.UNKNOWN);
    }
    return builder.build();
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic,
                                                  @Nullable String key,
                                                  @Nullable String data,
                                                  @Nullable Integer partition) {
    return new ProducerRecord<>(
        topic,
        partition,
        key != null ? key.getBytes() : null,
        data != null ? data.getBytes() : null
    );
  }

  @Override
  public TopicMessageSchemaDTO getTopicSchema(String topic) {
    final MessageSchemaDTO schema = new MessageSchemaDTO()
        .name("unknown")
        .source(MessageSchemaDTO.SourceEnum.UNKNOWN)
        .schema(JsonSchema.stringSchema().toJson(objectMapper));
    return new TopicMessageSchemaDTO()
        .key(schema)
        .value(schema);
  }
}
