package com.provectus.kafka.ui.deserialization;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;

public class SimpleRecordDeserializer implements RecordDeserializer {

  private final StringDeserializer stringDeserializer = new StringDeserializer();

  @Override
  public Object deserialize(ConsumerRecord<Bytes, Bytes> msg) {
    if (msg.value() != null) {
      return stringDeserializer.deserialize(msg.topic(), msg.value().get());
    } else {
      return "empty";
    }
  }
}
