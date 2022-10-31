package com.provectus.kafka.ui.emitter;

import java.util.concurrent.atomic.AtomicLong;
import lombok.AccessLevel;
import lombok.Getter;

public class MessageFilterStats {

  @Getter(AccessLevel.PACKAGE)
  private final AtomicLong filterApplyErrors = new AtomicLong();

  public final void incrementApplyErrors() {
    filterApplyErrors.incrementAndGet();
  }

}
