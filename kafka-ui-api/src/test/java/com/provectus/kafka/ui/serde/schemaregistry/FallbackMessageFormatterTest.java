package com.provectus.kafka.ui.serde.schemaregistry;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class FallbackMessageFormatterTest {

  @Test
  public void formatsStringAsString() {
    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    String actual = formatter.format("test", "test".getBytes(StandardCharsets.UTF_8));
    Assertions.assertEquals("test", actual);
  }

  @Test
  public void formatsJsonAsPrettyPrintedJson() {
    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    byte[] jsonMsg = "{\"key1\":\"value1\",\"key2\":\"value2\"}".getBytes(StandardCharsets.UTF_8);
    String actual = formatter.format("test", jsonMsg);
    Assertions.assertEquals("{\n"
            + "  \"key1\" : \"value1\",\n"
            + "  \"key2\" : \"value2\"\n"
            + "}", actual);
  }

  @Test
  public void formatsJsonEndingWithNewlineAsPrettyPrintedJson() {
    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    byte[] jsonMsg = "{\"key1\":\"value1\",\"key2\":\"value2\"}\n".getBytes(StandardCharsets.UTF_8);
    String actual = formatter.format("test", jsonMsg);
    Assertions.assertEquals("{\n"
            + "  \"key1\" : \"value1\",\n"
            + "  \"key2\" : \"value2\"\n"
            + "}", actual);
  }

  @Test
  public void formatsSmileMessageAsPrettyPrintedJson() {
    byte[] smileMessage = toBytes(0x3a, 0x29, 0x0a, 0x01, 0xfa, 0x82, 0x6b,
            0x65, 0x79, 0x43, 0x6b, 0x65, 0x79, 0x31, 0x84, 0x76, 0x61, 0x6c, 0x75,
            0x65, 0x45, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x31, 0xfb);

    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    String actual = formatter.format("test", smileMessage);
    Assertions.assertEquals("{\n"
            + "  \"key\" : \"key1\",\n"
            + "  \"value\" : \"value1\"\n"
            + "}", actual);
  }

  public static byte[] toBytes(int... ints) {
    byte[] result = new byte[ints.length];
    for (int i = 0; i < ints.length; i++) {
      result[i] = (byte) ints[i];
    }
    return result;
  }

  @Test
  public void formatsEmptyString() {
    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    String actual = formatter.format("test", "".getBytes(StandardCharsets.UTF_8));
    Assertions.assertEquals("", actual);
  }

  @Test
  public void formatsNullAsNull() {
    FallbackMessageFormatter formatter = new FallbackMessageFormatter();
    String actual = formatter.format("test", null);
    Assertions.assertNull(actual);
  }
}
