package com.provectus.kafka.ui.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalTopicMessage {
  private Integer partition;
  private Long offset;
  private OffsetDateTime timestamp;
  private TopicMessageTimestampType timestampType;
  private JsonNode key;
  private Map<String, String> headers;
  private JsonNode content;
  private MessageFormat keyFormat;
  private MessageFormat valueFormat;
  private Long keySize;
  private Long valueSize;
  private String keySchemaId;
  private String valueSchemaId;
  private Long headersSize;
}

