package com.provectus.kafka.ui.cluster.deserialization;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

public interface RecordDeserializer {

	Object deserialize(ConsumerRecord<Bytes, Bytes> record);
}
