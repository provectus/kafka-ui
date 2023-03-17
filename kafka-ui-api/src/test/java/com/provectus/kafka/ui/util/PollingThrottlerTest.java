package com.provectus.kafka.ui.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.data.Percentage.withPercentage;

import com.google.common.base.Stopwatch;
import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.emitter.PollingThrottler;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

class PollingThrottlerTest {

  @Test
  void testTrafficThrottled() {
    var throttler = new PollingThrottler("test", RateLimiter.create(1000));
    long polledBytes = 0;
    var stopwatch = Stopwatch.createStarted();
    while (stopwatch.elapsed(TimeUnit.SECONDS) < 1) {
      int newPolled = ThreadLocalRandom.current().nextInt(10);
      throttler.throttleAfterPoll(newPolled);
      polledBytes += newPolled;
    }
    assertThat(polledBytes).isCloseTo(1000, withPercentage(3.0));
  }

  @Test
  void noopThrottlerDoNotLimitPolling() {
    var noopThrottler = PollingThrottler.noop();
    var stopwatch = Stopwatch.createStarted();
    // emulating that we polled 1GB
    for (int i = 0; i < 1024; i++) {
      noopThrottler.throttleAfterPoll(1024 * 1024);
    }
    // checking that were are able to "poll" 1GB in less than a second
    assertThat(stopwatch.elapsed().getSeconds()).isLessThan(1);
  }

}
