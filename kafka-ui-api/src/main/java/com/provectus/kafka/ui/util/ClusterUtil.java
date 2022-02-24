package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.MessageFormatDTO;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;


@Slf4j
public class ClusterUtil {

  private ClusterUtil() {
  }

  private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

  public static int convertToIntServerStatus(ServerStatusDTO serverStatus) {
    return serverStatus.equals(ServerStatusDTO.ONLINE) ? 1 : 0;
  }

  public static TopicMessageDTO mapToTopicMessage(ConsumerRecord<Bytes, Bytes> consumerRecord,
                                                  RecordSerDe recordDeserializer) {

    Map<String, String> headers = new HashMap<>();
    consumerRecord.headers().iterator()
        .forEachRemaining(header ->
            headers.put(
                header.key(),
                header.value() != null ? new String(header.value()) : null
            )
    );

    TopicMessageDTO topicMessage = new TopicMessageDTO();

    OffsetDateTime timestamp =
        OffsetDateTime.ofInstant(Instant.ofEpochMilli(consumerRecord.timestamp()), UTC_ZONE_ID);
    TopicMessageDTO.TimestampTypeEnum timestampType =
        mapToTimestampType(consumerRecord.timestampType());
    topicMessage.setPartition(consumerRecord.partition());
    topicMessage.setOffset(consumerRecord.offset());
    topicMessage.setTimestamp(timestamp);
    topicMessage.setTimestampType(timestampType);

    topicMessage.setHeaders(headers);
    var parsed = recordDeserializer.deserialize(consumerRecord);
    topicMessage.setKey(parsed.getKey());
    topicMessage.setContent(parsed.getValue());
    topicMessage.setKeyFormat(parsed.getKeyFormat() != null
        ? MessageFormatDTO.valueOf(parsed.getKeyFormat().name())
        : null);
    topicMessage.setValueFormat(parsed.getValueFormat() != null
        ? MessageFormatDTO.valueOf(parsed.getValueFormat().name())
        : null);
    topicMessage.setKeySize(ConsumerRecordUtil.getKeySize(consumerRecord));
    topicMessage.setValueSize(ConsumerRecordUtil.getValueSize(consumerRecord));
    topicMessage.setKeySchemaId(parsed.getKeySchemaId());
    topicMessage.setValueSchemaId(parsed.getValueSchemaId());
    topicMessage.setHeadersSize(ConsumerRecordUtil.getHeadersSize(consumerRecord));

    return topicMessage;
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
}
