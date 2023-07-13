package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.stream.Stream;
import reactor.core.publisher.Mono;

public interface MetricsSink {

  static MetricsSink noop() {
    return m -> Mono.empty();
  }

  static MetricsSink create(ClustersProperties.MetricsConfig metricsConfig) {

  }

  Mono<Void> send(Stream<MetricFamilySamples> metrics);

}
