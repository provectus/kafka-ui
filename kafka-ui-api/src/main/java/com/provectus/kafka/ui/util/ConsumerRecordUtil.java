package com.provectus.kafka.ui.util;

import java.util.Arrays;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;

public class ConsumerRecordUtil {

  private ConsumerRecordUtil() {
  }

  public static int getHeadersSize(ConsumerRecord<?, ?> consumerRecord) {
    Headers headers = consumerRecord.headers();
    if (headers != null) {
      return Arrays.stream(consumerRecord.headers().toArray())
          .mapToInt(h -> headerSize(h))
          .sum();
    }
    return 0;
  }

  private static int headerSize(Header header) {
    int key = header.key() != null ? header.key().getBytes().length : 0;
    int val = header.value() != null ? header.value().length : 0;
    return key + val;
  }
}
