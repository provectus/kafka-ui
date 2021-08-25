package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.JsonNode;
import com.provectus.kafka.ui.util.JsonNodeUtil;

public class StringMessageFormatter implements MessageFormatter {

  @Override
  public JsonNode format(String topic, byte[] value) {
    return JsonNodeUtil.toJsonNode(value);
  }
}
