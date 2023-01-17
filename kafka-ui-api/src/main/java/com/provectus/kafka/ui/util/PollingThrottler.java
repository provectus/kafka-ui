package com.provectus.kafka.ui.util;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Optional;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.utils.Bytes;

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

  public void throttleAfterPoll(int polledBytes) {
    if (polledBytes > 0) {
      double sleptSeconds = rateLimiter.acquire(polledBytes);
      if (!throttled && sleptSeconds > 0.0) {
        throttled = true;
        log.debug("Polling throttling enabled for cluster {} at rate {} bytes/sec", clusterName, rateLimiter.getRate());
      }
    }
  }

  public void throttleAfterPoll(ConsumerRecords<Bytes, Bytes> polled) {
    throttleAfterPoll(ConsumerRecordsUtil.calculatePolledSize(polled));
  }

}
