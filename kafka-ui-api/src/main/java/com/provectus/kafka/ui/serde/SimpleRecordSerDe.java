package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.MessageSchema;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.serde.schemaregistry.MessageFormat;
import com.provectus.kafka.ui.util.ConsumerRecordUtil;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordSerDe implements RecordSerDe {

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
