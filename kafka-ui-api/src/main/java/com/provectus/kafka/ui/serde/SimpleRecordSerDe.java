package com.provectus.kafka.ui.serde;

import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.serde.schemaregistry.StringMessageFormatter;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordSerDe implements RecordSerDe {

  private static final StringMessageFormatter FORMATTER = new StringMessageFormatter();

  @Override
  public DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    var builder = DeserializedKeyValue.builder();
    if (msg.key() != null) {
      builder.key(FORMATTER.format(msg.topic(), msg.key().get()));
      builder.keyFormat(FORMATTER.getFormat());
    }
    if (msg.value() != null) {
      builder.value(FORMATTER.format(msg.topic(), msg.value().get()));
      builder.valueFormat(FORMATTER.getFormat());
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
        .schema(JsonSchema.stringSchema().toJson());
    return new TopicMessageSchemaDTO()
        .key(schema)
        .value(schema);
  }
}
