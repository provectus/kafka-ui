package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.time.Duration;
import java.util.Optional;
import java.util.function.Supplier;

public class PollingSettings {

  private static final Duration DEFAULT_POLL_TIMEOUT = Duration.ofMillis(1_000);
  private static final Duration DEFAULT_PARTITION_POLL_TIMEOUT = Duration.ofMillis(200);
  private static final int DEFAULT_NO_DATA_EMPTY_POLLS = 3;

  private final Duration pollTimeout;
  private final Duration partitionPollTimeout;

  private final Supplier<PollingThrottler> throttlerSupplier;

  public static PollingSettings create(ClustersProperties.Cluster cluster,
                                       ClustersProperties clustersProperties) {
    var pollingProps = Optional.ofNullable(clustersProperties.getPolling())
        .orElseGet(ClustersProperties.PollingProperties::new);

    var pollTimeout = pollingProps.getPollTimeoutMs() != null
        ? Duration.ofMillis(pollingProps.getPollTimeoutMs())
        : DEFAULT_POLL_TIMEOUT;

    var partitionPollTimeout = pollingProps.getPartitionPollTimeout() != null
        ? Duration.ofMillis(pollingProps.getPartitionPollTimeout())
        : Duration.ofMillis(pollTimeout.toMillis() / 5);

    int noDataEmptyPolls = pollingProps.getNoDataEmptyPolls() != null
        ? pollingProps.getNoDataEmptyPolls()
        : DEFAULT_NO_DATA_EMPTY_POLLS;

    return new PollingSettings(
        pollTimeout,
        partitionPollTimeout,
        PollingThrottler.throttlerSupplier(cluster)
    );
  }

  public static PollingSettings createDefault() {
    return new PollingSettings(
        DEFAULT_POLL_TIMEOUT,
        DEFAULT_PARTITION_POLL_TIMEOUT,
        PollingThrottler::noop
    );
  }

  private PollingSettings(Duration pollTimeout,
                          Duration partitionPollTimeout,
                          Supplier<PollingThrottler> throttlerSupplier) {
    this.pollTimeout = pollTimeout;
    this.partitionPollTimeout = partitionPollTimeout;
    this.throttlerSupplier = throttlerSupplier;
  }

  public Duration getPollTimeout() {
    return pollTimeout;
  }

  public Duration getPartitionPollTimeout() {
    return partitionPollTimeout;
  }

  public PollingThrottler getPollingThrottler() {
    return throttlerSupplier.get();
  }
}
