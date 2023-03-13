package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.serde.api.Serde;
import java.util.Map;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;

@RequiredArgsConstructor
public class ProducerRecordCreator {

  private final Serde.Serializer keySerializer;
  private final Serde.Serializer valuesSerializer;

  public ProducerRecord<byte[], byte[]> create(String topic,
                                               @Nullable Integer partition,
                                               @Nullable String key,
                                               @Nullable String value,
                                               @Nullable Map<String, String> headers) {
    return new ProducerRecord<>(
        topic,
        partition,
        key == null ? null : keySerializer.serialize(key),
        value == null ? null : valuesSerializer.serialize(value),
        headers == null ? null : createHeaders(headers)
    );
  }

  private Iterable<Header> createHeaders(Map<String, String> clientHeaders) {
    RecordHeaders headers = new RecordHeaders();
    clientHeaders.forEach((k, v) -> headers.add(new RecordHeader(k, v.getBytes())));
    return headers;
  }

}
