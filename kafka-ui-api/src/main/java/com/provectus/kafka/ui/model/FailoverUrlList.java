package com.provectus.kafka.ui.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.experimental.Delegate;

public class FailoverUrlList {

  public static final int DEFAULT_RETRY_GRACE_PERIOD_IN_MS = 5000;

  private final Map<Integer, Instant> failures = new ConcurrentHashMap<>();
  private final AtomicInteger index = new AtomicInteger(0);
  @Delegate
  private final List<String> urls;
  private final int retryGracePeriodInMs;

  public FailoverUrlList(List<String> urls) {
    this(urls, DEFAULT_RETRY_GRACE_PERIOD_IN_MS);
  }

  public FailoverUrlList(List<String> urls, int retryGracePeriodInMs) {
    if (urls != null && !urls.isEmpty()) {
      this.urls = new ArrayList<>(urls);
    } else {
      throw new IllegalArgumentException("Expected at least one URL to be passed in constructor");
    }
    this.retryGracePeriodInMs = retryGracePeriodInMs;
  }

  public String current() {
    return this.urls.get(this.index.get());
  }

  public void fail(String url) {
    int currentIndex = this.index.get();
    if ((this.urls.get(currentIndex)).equals(url)) {
      this.failures.put(currentIndex, Instant.now());
      this.index.compareAndSet(currentIndex, (currentIndex + 1) % this.urls.size());
    }
  }

  public boolean isFailoverAvailable() {
    var now = Instant.now();
    return this.urls.size() > this.failures.size()
            || this.failures
                    .values()
                    .stream()
                    .anyMatch(e -> now.isAfter(e.plusMillis(retryGracePeriodInMs)));
  }

  @Override
  public String toString() {
    return this.urls.toString();
  }
}
