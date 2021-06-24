package com.provectus.kafka.ui.serde;

import com.provectus.kafka.ui.model.TopicMessageSchema;
import java.util.Optional;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.util.function.Tuple2;

public interface RecordSerDe {

  Tuple2<String, Object> deserialize(ConsumerRecord<Bytes, Bytes> msg);

  ProducerRecord<byte[], byte[]> serialize(String topic, byte[] key, byte[] data,
                                           Optional<Integer> partition);

  TopicMessageSchema getTopicSchema(String topic);
}
