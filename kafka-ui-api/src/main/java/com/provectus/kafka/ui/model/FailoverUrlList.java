package com.provectus.kafka.ui.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class FailoverUrlList {

  public static final int DEFAULT_RETRY_GRACE_PERIOD_IN_MS = 5000;

  private final Map<Integer, Instant> failures = new HashMap<>();
  private final List<String> urls;
  private final int retryGracePeriodInMs;

  private Integer index;

  public FailoverUrlList(List<String> urls) {
    this(urls, DEFAULT_RETRY_GRACE_PERIOD_IN_MS);
  }

  public FailoverUrlList(List<String> urls, int retryGracePeriodInMs) {
    if (urls != null && !urls.isEmpty()) {
      this.urls = new ArrayList<>(urls);
      this.index = new Random().nextInt(urls.size());
    } else {
      throw new IllegalArgumentException("Expected at least one URL to be passed in constructor");
    }
    this.retryGracePeriodInMs = retryGracePeriodInMs;
  }

  public String current() {
    return this.urls.get(this.index);
  }

  public synchronized void fail(String url) {
    int currentIndex = this.index;
    if ((this.urls.get(currentIndex)).equals(url)) {
      this.failures.put(currentIndex, Instant.now());
      this.index = (currentIndex + 1) % this.urls.size();
    }
  }

  public int size() {
    return this.urls.size();
  }

  public boolean isFailoverAvailable() {
    return this.urls.size() > this.failures.size()
            || this.failures
                    .values()
                    .stream()
                    .anyMatch(e -> Instant.now().isAfter(e.plusMillis(retryGracePeriodInMs)));
  }

  public String toString() {
    return this.urls.toString();
  }
}
