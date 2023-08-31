package com.provectus.kafka.ui.util;

import static lombok.AccessLevel.PRIVATE;

import com.google.common.annotations.VisibleForTesting;
import com.provectus.kafka.ui.emitter.PolledRecords;
import com.provectus.kafka.ui.model.KafkaCluster;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Metrics;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(access = PRIVATE)
public class ApplicationMetrics {

  // kafka-ui specific metrics prefix. Added to make it easier to distinguish kui metrics from
  // other metrics, exposed by spring boot (like http stats, jvm, etc.)
  private static final String COMMON_PREFIX = "kui_";

  private final String clusterName;
  private final MeterRegistry registry;

  public static ApplicationMetrics forCluster(KafkaCluster cluster) {
    return new ApplicationMetrics(cluster.getName(), Metrics.globalRegistry);
  }

  @VisibleForTesting
  public static ApplicationMetrics noop() {
    return new ApplicationMetrics("noop", new SimpleMeterRegistry());
  }

  public void meterPolledRecords(String topic, PolledRecords polled, boolean throttled) {
    pollTimer(topic).record(polled.elapsed());
    polledRecords(topic).increment(polled.count());
    polledBytes(topic).record(polled.bytes());
    if (throttled) {
      pollThrottlingActivations().increment();
    }
  }

  private Counter polledRecords(String topic) {
    return Counter.builder(COMMON_PREFIX + "topic_records_polled")
        .description("Number of records polled from topic")
        .tag("cluster", clusterName)
        .tag("topic", topic)
        .register(registry);
  }

  private DistributionSummary polledBytes(String topic) {
    return DistributionSummary.builder(COMMON_PREFIX + "topic_polled_bytes")
        .description("Bytes polled from kafka topic")
        .tag("cluster", clusterName)
        .tag("topic", topic)
        .register(registry);
  }

  private Timer pollTimer(String topic) {
    return Timer.builder(COMMON_PREFIX + "topic_poll_time")
        .description("Time spend in polling for topic")
        .tag("cluster", clusterName)
        .tag("topic", topic)
        .register(registry);
  }

  private Counter pollThrottlingActivations() {
    return Counter.builder(COMMON_PREFIX + "poll_throttling_activations")
        .description("Number of poll throttling activations")
        .tag("cluster", clusterName)
        .register(registry);
  }

  public AtomicInteger activeConsumers() {
    var count = new AtomicInteger();
    Gauge.builder(COMMON_PREFIX + "active_consumers", () -> count)
        .description("Number of active consumers")
        .tag("cluster", clusterName)
        .register(registry);
    return count;
  }

}
