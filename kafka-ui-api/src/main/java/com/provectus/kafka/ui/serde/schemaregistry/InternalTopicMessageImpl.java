package com.provectus.kafka.ui.serde.schemaregistry;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public class InternalTopicMessageImpl extends com.provectus.kafka.ui.model.InternalTopicMessage {
  @JsonProperty("key")
  private JsonNode key;

  @JsonProperty("content")
  private JsonNode content;

  public InternalTopicMessageImpl content(JsonNode content) {
    this.content = content;
    return this;
  }

  @Override
  public JsonNode getContent() {
    return content;
  }

  public void setContent(JsonNode content) {
    this.content = content;
  }

  public InternalTopicMessageImpl key(JsonNode key) {
    this.key = key;
    return this;
  }

  @Override
  public JsonNode getKey() {
    return key;
  }

  public void setKey(JsonNode key) {
    this.key = key;
  }

}
