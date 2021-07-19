package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.MessageSchema;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordSerDe implements RecordSerDe {

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    String key = msg.key() != null ? new String(msg.key().get()) : null;
    String value = msg.value() != null ? new String(msg.value().get()) : null;
    Integer valueLength = msg.value() != null ? msg.value().get().length : null;
    return new DeserializedKeyValue(key, value, null, valueLength, null);
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
  public TopicMessageSchema getTopicSchema(String topic) {
    final MessageSchema schema = new MessageSchema()
        .name("unknown")
        .source(MessageSchema.SourceEnum.UNKNOWN)
        .schema(JsonSchema.stringSchema().toJson(new ObjectMapper()));
    return new TopicMessageSchema()
        .key(schema)
        .value(schema);
  }
}
