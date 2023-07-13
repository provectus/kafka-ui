package com.provectus.kafka.ui.service.metrics.sink;

import static io.prometheus.client.Collector.MetricFamilySamples;

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
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

@RequiredArgsConstructor
class PrometheusPushGatewaySink implements MetricsSink {

  private final static String DEFAULT_PGW_JOBNAME = "kafkaui";

  private final PushGateway pushGateway;
  private final String job;
  //TODO: read about grouping rules

  @SneakyThrows
  static PrometheusPushGatewaySink create(String url,
                                          @Nullable String job,
                                          @Nullable String username,
                                          @Nullable String passw) {
    var pushGateway = new PushGateway(new URL(url));
    if (StringUtils.hasText(username) && StringUtils.hasText(passw)) {
      pushGateway.setConnectionFactory(new BasicAuthHttpConnectionFactory(username, passw));
    }
    return new PrometheusPushGatewaySink(
        pushGateway,
        Optional.ofNullable(job).orElse(DEFAULT_PGW_JOBNAME)
    );
  }

  @Override
  public Mono<Void> send(Stream<MetricFamilySamples> metrics) {
    return Mono.<Void>fromRunnable(() -> pushSync(metrics.toList()))
        .subscribeOn(Schedulers.boundedElastic());
  }

  @SneakyThrows
  private void pushSync(List<MetricFamilySamples> metricsToPush) {
    if (metricsToPush.isEmpty()) {
      return;
    }
    pushGateway.push(
        new Collector() {
          @Override
          public List<MetricFamilySamples> collect() {
            return metricsToPush;
          }
        },
        job
    );
  }
}
