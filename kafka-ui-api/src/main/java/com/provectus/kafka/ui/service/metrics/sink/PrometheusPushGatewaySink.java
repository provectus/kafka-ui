package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static org.springframework.util.StringUtils.hasText;

import io.prometheus.client.Collector;
import io.prometheus.client.exporter.BasicAuthHttpConnectionFactory;
import io.prometheus.client.exporter.PushGateway;
import jakarta.annotation.Nullable;
import java.net.URL;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RequiredArgsConstructor
class PrometheusPushGatewaySink implements MetricsSink {

  private static final String DEFAULT_PGW_JOB_NAME = "kafkaui";

  private final PushGateway pushGateway;
  private final String job;

  @SneakyThrows
  static PrometheusPushGatewaySink create(String url,
                                          @Nullable String jobName,
                                          @Nullable String username,
                                          @Nullable String passw) {
    var pushGateway = new PushGateway(new URL(url));
    if (hasText(username) && hasText(passw)) {
      pushGateway.setConnectionFactory(new BasicAuthHttpConnectionFactory(username, passw));
    }
    return new PrometheusPushGatewaySink(
        pushGateway,
        Optional.ofNullable(jobName).orElse(DEFAULT_PGW_JOB_NAME)
    );
  }

  @Override
  public Mono<Void> send(Stream<MetricFamilySamples> metrics) {
    List<MetricFamilySamples> metricsToPush = metrics.toList();
    if (metricsToPush.isEmpty()) {
      return Mono.empty();
    }
    return Mono.<Void>fromRunnable(() -> pushSync(metricsToPush))
        .subscribeOn(Schedulers.boundedElastic());
  }

  @SneakyThrows
  private void pushSync(List<MetricFamilySamples> metricsToPush) {
    Collector allMetrics = new Collector() {
      @Override
      public List<MetricFamilySamples> collect() {
        return metricsToPush;
      }
    };
    pushGateway.push(allMetrics, job);
  }
}
