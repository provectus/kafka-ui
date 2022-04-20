package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.dataformat.smile.databind.SmileMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class FallbackMessageFormatter implements MessageFormatter {
  private static final SmileMapper smileMapper = new SmileMapper();
  private static final JsonMapper jsonMapper = new JsonMapper();

  @Override
  public String format(String topic, byte[] value) {
    if (value == null) {
      return null;
    }
    String decodedString = new String(value, StandardCharsets.UTF_8);
    if (isJsonLike(decodedString)) {
      try {
        return jsonMapper.readTree(value).toPrettyString();
      } catch (IOException e) {
        return decodedString;
      }
    } else if (isSmileFormat(value)) {
      try {
        return smileMapper.readTree(value).toPrettyString();
      } catch (IOException e) {
        return decodedString;
      }
    } else {
      return decodedString;
    }
  }

  private boolean isJsonLike(String value) {
    return value.length() >= 4
            && (value.startsWith("{") && value.endsWith("}"))
            || (value.startsWith("{") && value.endsWith("}\n"))
            || (value.startsWith("{") && value.endsWith("}\r\n"));

  }

  private boolean isSmileFormat(byte[] value) {
    return value.length > 3 && value[0] == 0x3a && value[1] == 0x29 && value[2] == 0x0a;
  }

}
