package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static org.springframework.util.StringUtils.hasText;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.Optional;
import java.util.stream.Stream;
import reactor.core.publisher.Mono;

public interface MetricsSink {

  static MetricsSink create(ClustersProperties.Cluster cluster) {
    return Optional.ofNullable(cluster.getMetrics())
        .flatMap(metrics -> Optional.ofNullable(metrics.getStore()))
        .flatMap(store -> Optional.ofNullable(store.getPrometheus()))
        .map(prometheusConf -> {
              if (hasText(prometheusConf.getUrl()) && Boolean.TRUE.equals(prometheusConf.getRemoteWrite())) {
                return new PrometheusRemoteWriteSink(prometheusConf.getUrl());
              }
              if (hasText(prometheusConf.getPushGatewayUrl())) {
                return PrometheusPushGatewaySink.create(
                    prometheusConf.getPushGatewayUrl(),
                    prometheusConf.getPushGatewayJobName(),
                    prometheusConf.getPushGatewayUsername(),
                    prometheusConf.getPushGatewayPassword()
                );
              }
              return noop();
            }
        ).orElse(noop());
  }

  static MetricsSink noop() {
    return m -> Mono.empty();
  }

  Mono<Void> send(Stream<MetricFamilySamples> metrics);

}
