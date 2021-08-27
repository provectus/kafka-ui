package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalTopicMessageEvent {
  private TopicMessageEventType type;
  private InternalTopicMessage message;
  private TopicMessagePhase phase;
  private TopicMessageConsuming consuming;
}

