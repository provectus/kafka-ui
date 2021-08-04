package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.TopicMessageEvent;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Predicate;

public class FilterTopicMessageEvents implements Predicate<TopicMessageEvent> {
  private final AtomicInteger processed = new AtomicInteger();
  private final int limit;

  public FilterTopicMessageEvents(int limit) {
    this.limit = limit;
  }

  @Override
  public boolean test(TopicMessageEvent event) {
    if (event.getType().equals(TopicMessageEvent.TypeEnum.MESSAGE)) {
      final int i = processed.incrementAndGet();
      if (i > limit) {
        return false;
      }
    }
    return true;
  }
}
