package com.provectus.kafka.ui.util;

import java.util.Arrays;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;

public class ConsumerRecordUtil {

  private ConsumerRecordUtil() {
  }

  public static Long getHeadersSize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    Headers headers = consumerRecord.headers();
    if (headers != null) {
      return Arrays.stream(consumerRecord.headers().toArray())
          .mapToLong(ConsumerRecordUtil::headerSize)
          .sum();
    }
    return 0L;
  }

  public static Long getKeySize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    return consumerRecord.key() != null ? (long) consumerRecord.key().get().length : null;
  }

  public static Long getValueSize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    return consumerRecord.value() != null ? (long) consumerRecord.value().get().length : null;
  }

  private static int headerSize(Header header) {
    int key = header.key() != null ? header.key().getBytes().length : 0;
    int val = header.value() != null ? header.value().length : 0;
    return key + val;
  }
}
