package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.MessageSchema;
import com.provectus.kafka.ui.model.TopicMessageSchema;
import com.provectus.kafka.ui.util.jsonschema.JsonSchema;
import java.util.Optional;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class SimpleRecordSerDe implements RecordSerDe {

  @Override
  public Tuple2<String, Object> deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    return Tuples.of(
        msg.key() != null ? new String(msg.key().get()) : "",
        msg.value() != null ? new String(msg.value().get()) : ""
    );
  }

  @Override
  public ProducerRecord<byte[], byte[]> serialize(String topic, byte[] key, byte[] data,
                                                  Optional<Integer> partition) {
    return partition.map(p -> new ProducerRecord<>(topic, p, key, data))
        .orElseGet(() -> new ProducerRecord<>(topic, key, data));
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
