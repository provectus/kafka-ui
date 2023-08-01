package com.provectus.kafka.ui.emitter;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PollingThrottler {

  public static Supplier<PollingThrottler> throttlerSupplier(ClustersProperties.Cluster cluster) {
    Long rate = cluster.getPollingThrottleRate();
    if (rate == null || rate <= 0) {
      return PollingThrottler::noop;
    }
    // RateLimiter instance should be shared across all created throttlers
    var rateLimiter = RateLimiter.create(rate);
    return () -> new PollingThrottler(cluster.getName(), rateLimiter);
  }

  private final String clusterName;
  private final RateLimiter rateLimiter;
  private boolean throttled;

  @VisibleForTesting
  public PollingThrottler(String clusterName, RateLimiter rateLimiter) {
    this.clusterName = clusterName;
    this.rateLimiter = rateLimiter;
  }

  public static PollingThrottler noop() {
    return new PollingThrottler("noop", RateLimiter.create(Long.MAX_VALUE));
  }

  //returns true if polling was throttled
  public boolean throttleAfterPoll(int polledBytes) {
    if (polledBytes > 0) {
      double sleptSeconds = rateLimiter.acquire(polledBytes);
      if (!throttled && sleptSeconds > 0.0) {
        throttled = true;
        log.debug("Polling throttling enabled for cluster {} at rate {} bytes/sec", clusterName, rateLimiter.getRate());
        return true;
      }
    }
    return false;
  }

}
