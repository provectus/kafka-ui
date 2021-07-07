package com.provectus.kafka.ui.serde;

import com.provectus.kafka.ui.model.TopicMessageSchema;
import javax.annotation.Nullable;
import lombok.Value;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public interface RecordSerDe {

  @Value
  class DeserializedKeyValue {
    @Nullable Object key;
    @Nullable Object value;
  }

  DeserializedKeyValue deserialize(ConsumerRecord<Bytes, Bytes> msg);

  ProducerRecord<byte[], byte[]> serialize(String topic,
                                           @Nullable ParsedInputObject key,
                                           @Nullable ParsedInputObject data,
                                           @Nullable Integer partition);

  TopicMessageSchema getTopicSchema(String topic);
}
