package com.provectus.kafka.ui.cluster.deserialization;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordDeserializer implements RecordDeserializer {

	private final StringDeserializer stringDeserializer = new StringDeserializer();

	@Override
	public Object deserialize(ConsumerRecord<Bytes, Bytes> record) {
		return stringDeserializer.deserialize(record.topic(), record.value().get());
	}
}
