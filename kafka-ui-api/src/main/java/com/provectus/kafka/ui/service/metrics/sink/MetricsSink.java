package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static org.springframework.util.StringUtils.hasText;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MetricsSink {

  static MetricsSink create(ClustersProperties.Cluster cluster) {
    List<MetricsSink> sinks = new ArrayList<>();
    Optional.ofNullable(cluster.getMetrics())
        .flatMap(metrics -> Optional.ofNullable(metrics.getStore()))
        .flatMap(store -> Optional.ofNullable(store.getPrometheus()))
        .ifPresent(prometheusConf -> {
          if (hasText(prometheusConf.getUrl()) && Boolean.TRUE.equals(prometheusConf.getRemoteWrite())) {
            sinks.add(new PrometheusRemoteWriteSink(prometheusConf.getUrl(), cluster.getSsl()));
          }
          if (hasText(prometheusConf.getPushGatewayUrl())) {
            sinks.add(
                PrometheusPushGatewaySink.create(
                    prometheusConf.getPushGatewayUrl(),
                    prometheusConf.getPushGatewayJobName(),
                    prometheusConf.getPushGatewayUsername(),
                    prometheusConf.getPushGatewayPassword()
                ));
          }
        });

    Optional.ofNullable(cluster.getMetrics())
        .flatMap(metrics -> Optional.ofNullable(metrics.getStore()))
        .flatMap(store -> Optional.ofNullable(store.getKafka()))
        .flatMap(kafka -> Optional.ofNullable(kafka.getTopic()))
        .ifPresent(topic -> sinks.add(KafkaSink.create(cluster, topic)));

    return compoundSink(sinks);
  }

  private static MetricsSink compoundSink(List<MetricsSink> sinks) {
    return metricsStream -> {
      var materialized = metricsStream.toList();
      return Flux.fromIterable(sinks)
          .flatMap(sink -> sink.send(materialized.stream()))
          .then();
    };
  }

  Mono<Void> send(Stream<MetricFamilySamples> metrics);

}
