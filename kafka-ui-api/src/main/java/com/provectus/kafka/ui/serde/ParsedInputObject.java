package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import lombok.SneakyThrows;

/**
 * This is utility wrapper for input parameters that have 'object' type in openapi yaml.
 * 'object' type can be parsed into Map[String, Object], Integer, String, etc.,
 * so this class contains methods that helps to check into what java type it was parsed.
 */
public class ParsedInputObject {

  private static final ObjectMapper OM = new ObjectMapper();

  private final Object object;

  public ParsedInputObject(Object object) {
    this.object = object;
  }

  public boolean isJsonObject() {
    return object instanceof Map;
  }

  @SneakyThrows
  public String jsonForSerializing() {
    if (isJsonObject()) {
      return OM.writeValueAsString(object);
    }
    return object.toString();
  }
}
