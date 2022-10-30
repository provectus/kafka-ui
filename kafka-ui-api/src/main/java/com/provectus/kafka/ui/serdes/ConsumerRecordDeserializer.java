package com.provectus.kafka.ui.serdes;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serde.api.Serde;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
@RequiredArgsConstructor
public class ConsumerRecordDeserializer {

  private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

  private final String keySerdeName;
  private final Serde.Deserializer keyDeserializer;

  private final String valueSerdeName;
  private final Serde.Deserializer valueDeserializer;

  private final String fallbackSerdeName;
  private final Serde.Deserializer fallbackKeyDeserializer;
  private final Serde.Deserializer fallbackValueDeserializer;

  private final Function<String, String> keyMasking;
  private final Function<String, String> valueMasking;

  public TopicMessageDTO deserialize(ConsumerRecord<Bytes, Bytes> rec) {
    var message = new TopicMessageDTO();
    fillKey(message, rec);
    fillValue(message, rec);
    fillHeaders(message, rec);

    message.setPartition(rec.partition());
    message.setOffset(rec.offset());
    message.setTimestampType(mapToTimestampType(rec.timestampType()));
    message.setTimestamp(OffsetDateTime.ofInstant(Instant.ofEpochMilli(rec.timestamp()), UTC_ZONE_ID));

    message.setKeySize(getKeySize(rec));
    message.setValueSize(getValueSize(rec));
    message.setHeadersSize(getHeadersSize(rec));

    return message;
  }

  private static TopicMessageDTO.TimestampTypeEnum mapToTimestampType(TimestampType timestampType) {
    switch (timestampType) {
      case CREATE_TIME:
        return TopicMessageDTO.TimestampTypeEnum.CREATE_TIME;
      case LOG_APPEND_TIME:
        return TopicMessageDTO.TimestampTypeEnum.LOG_APPEND_TIME;
      case NO_TIMESTAMP_TYPE:
        return TopicMessageDTO.TimestampTypeEnum.NO_TIMESTAMP_TYPE;
      default:
        throw new IllegalArgumentException("Unknown timestampType: " + timestampType);
    }
  }

  private void fillHeaders(TopicMessageDTO message, ConsumerRecord<Bytes, Bytes> rec) {
    Map<String, String> headers = new HashMap<>();
    rec.headers().iterator()
        .forEachRemaining(header ->
            headers.put(
                header.key(),
                header.value() != null ? new String(header.value()) : null
            ));
    message.setHeaders(headers);
  }

  private void fillKey(TopicMessageDTO message, ConsumerRecord<Bytes, Bytes> rec) {
    if (rec.key() == null) {
      return;
    }
    try {
      var deserResult = keyDeserializer.deserialize(new RecordHeadersImpl(), rec.key().get());
      message.setKey(maskNullable(deserResult.getResult(), keyMasking));
      message.setKeySerde(keySerdeName);
      message.setKeyDeserializeProperties(deserResult.getAdditionalProperties());
    } catch (Exception e) {
      log.trace("Error deserializing key for key topic: {}, partition {}, offset {}, with serde {}",
          rec.topic(), rec.partition(), rec.offset(), keySerdeName, e);
      var deserResult = fallbackKeyDeserializer.deserialize(new RecordHeadersImpl(), rec.key().get());
      message.setKey(maskNullable(deserResult.getResult(), keyMasking));
      message.setKeySerde(fallbackSerdeName);
    }
  }

  private void fillValue(TopicMessageDTO message, ConsumerRecord<Bytes, Bytes> rec) {
    if (rec.value() == null) {
      return;
    }
    try {
      var deserResult = valueDeserializer.deserialize(
          new RecordHeadersImpl(rec.headers()), rec.value().get());
      message.setContent(maskNullable(deserResult.getResult(), valueMasking));
      message.setValueSerde(valueSerdeName);
      message.setValueDeserializeProperties(deserResult.getAdditionalProperties());
    } catch (Exception e) {
      log.trace("Error deserializing key for value topic: {}, partition {}, offset {}, with serde {}",
          rec.topic(), rec.partition(), rec.offset(), valueSerdeName, e);
      var deserResult = fallbackValueDeserializer.deserialize(
          new RecordHeadersImpl(rec.headers()), rec.value().get());
      message.setContent(maskNullable(deserResult.getResult(), valueMasking));
      message.setValueSerde(fallbackSerdeName);
    }
  }

  private static String maskNullable(@Nullable String val, Function<String, String> mask) {
    return val == null ? null : mask.apply(val);
  }

  private static Long getHeadersSize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    Headers headers = consumerRecord.headers();
    if (headers != null) {
      return Arrays.stream(headers.toArray())
          .mapToLong(ConsumerRecordDeserializer::headerSize)
          .sum();
    }
    return 0L;
  }

  private static Long getKeySize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    return consumerRecord.key() != null ? (long) consumerRecord.key().get().length : null;
  }

  private static Long getValueSize(ConsumerRecord<Bytes, Bytes> consumerRecord) {
    return consumerRecord.value() != null ? (long) consumerRecord.value().get().length : null;
  }

  private static int headerSize(Header header) {
    int key = header.key() != null ? header.key().getBytes().length : 0;
    int val = header.value() != null ? header.value().length : 0;
    return key + val;
  }

}
