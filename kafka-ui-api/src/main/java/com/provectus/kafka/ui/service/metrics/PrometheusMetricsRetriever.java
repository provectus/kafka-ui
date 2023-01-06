package com.provectus.kafka.ui.service.metrics;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import java.util.Arrays;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
class PrometheusMetricsRetriever implements MetricsRetriever {

  private static final String METRICS_ENDPOINT_PATH = "/metrics";
  private static final int DEFAULT_EXPORTER_PORT = 11001;

  private final WebClient webClient;

  @Override
  public Flux<RawMetric> retrieve(KafkaCluster c, Node node) {
    log.debug("Retrieving metrics from prometheus exporter: {}:{}", node.host(), c.getMetricsConfig().getPort());
    return retrieve(node.host(), c.getMetricsConfig());
  }

  @VisibleForTesting
  Flux<RawMetric> retrieve(String host, MetricsConfig metricsConfig) {
    int port = Optional.ofNullable(metricsConfig.getPort()).orElse(DEFAULT_EXPORTER_PORT);

    var request = webClient.get()
        .uri(UriComponentsBuilder.newInstance()
            .scheme(metricsConfig.isSsl() ? "https" : "http")
            .host(host)
            .port(port)
            .path(METRICS_ENDPOINT_PATH).build().toUri());

    if (metricsConfig.getUsername() != null && metricsConfig.getPassword() != null) {
      request.headers(
          httpHeaders -> httpHeaders.setBasicAuth(metricsConfig.getUsername(), metricsConfig.getPassword()));
    }

    WebClient.ResponseSpec responseSpec = request.retrieve();

    return responseSpec.bodyToMono(String.class)
        .doOnError(e -> log.error("Error while getting metrics from {}", host, e))
        .onErrorResume(th -> Mono.empty())
        .flatMapMany(body ->
            Flux.fromStream(
                Arrays.stream(body.split("\\n"))
                    .filter(str -> !Strings.isNullOrEmpty(str) && !str.startsWith("#")) // skipping comments strings
                    .map(PrometheusEndpointMetricsParser::parse)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
            )
        );
  }
}
