package com.provectus.kafka.ui.serde;

import com.provectus.kafka.ui.model.TopicMessageSchema;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;

public interface RecordSerDe {

  Tuple2<String, Object> deserialize(ConsumerRecord<Bytes, Bytes> msg);

  ProducerRecord<byte[], byte[]> serialize(String topic,
                                           @Nullable byte[] key,
                                           @Nullable byte[] data,
                                           @Nullable Integer partition);

  TopicMessageSchema getTopicSchema(String topic);
}
