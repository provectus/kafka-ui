package com.provectus.kafka.ui.util;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.utils.Bytes;

public class ConsumerRecordsUtil {

  public static int calculatePolledRecSize(ConsumerRecord<Bytes, Bytes> rec) {
    int polledBytes = 0;
    for (Header header : rec.headers()) {
      polledBytes +=
          (header.key() != null ? header.key().getBytes().length : 0L)
              + (header.value() != null ? header.value().length : 0L);
    }
    polledBytes += rec.key() == null ? 0 : rec.serializedKeySize();
    polledBytes += rec.value() == null ? 0 : rec.serializedValueSize();
    return polledBytes;
  }

  public static int calculatePolledSize(Iterable<ConsumerRecord<Bytes, Bytes>> recs) {
    int polledBytes = 0;
    for (ConsumerRecord<Bytes, Bytes> rec : recs) {
      polledBytes += calculatePolledRecSize(rec);
    }
    return polledBytes;
  }

}
