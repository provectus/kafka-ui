package com.provectus.kafka.ui.serde.api;

import java.util.Map;

public final class DeserializeResult {

  public enum Type {
    STRING, JSON
  }

  private final String result;
  private final Type type;
  private final Map<String, Object> additionalProperties;

  public DeserializeResult(String result, Type type, Map<String, Object> additionalProperties) {
    this.result = result;
    this.type = type;
    this.additionalProperties = additionalProperties;
  }

  public String getResult() {
    return result;
  }

  public Map<String, Object> getAdditionalProperties() {
    return additionalProperties;
  }

  public Type getType() {
    return type;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    DeserializeResult that = (DeserializeResult) o;
    if (!result.equals(that.result)) {
      return false;
    }
    if (type != that.type) {
      return false;
    }
    return additionalProperties.equals(that.additionalProperties);
  }

  @Override
  public int hashCode() {
    int result = this.result.hashCode();
    result = 31 * result + type.hashCode();
    result = 31 * result + additionalProperties.hashCode();
    return result;
  }
}
