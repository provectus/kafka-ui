package com.provectus.kafka.ui.deserialization;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

public interface RecordDeserializer {

  Object deserialize(ConsumerRecord<Bytes, Bytes> msg);
}
