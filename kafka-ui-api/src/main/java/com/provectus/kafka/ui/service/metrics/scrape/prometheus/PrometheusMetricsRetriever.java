package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import static io.prometheus.client.Collector.*;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
class PrometheusMetricsRetriever {

  private static final String METRICS_ENDPOINT_PATH = "/metrics";
  private static final int DEFAULT_EXPORTER_PORT = 11001;

  Mono<List<MetricFamilySamples>> retrieve(MetricsScrapeProperties metricsConfig, Node node) {
    log.debug("Retrieving metrics from prometheus exporter: {}:{}", node.host(), metricsConfig.getPort());

    var webClient = new WebClientConfigurator()
        .configureBufferSize(DataSize.ofMegabytes(20))
        .configureBasicAuth(metricsConfig.getUsername(), metricsConfig.getPassword())
        .configureSsl(metricsConfig.getTruststoreConfig(), metricsConfig.getKeystoreConfig())
        .build();

    return retrieve(webClient, node.host(), metricsConfig)
        .collectList()
        .map(metrics -> RawMetric.groupIntoMFS(metrics).toList());
  }

  @VisibleForTesting
  Flux<RawMetric> retrieve(WebClient webClient, String host, MetricsScrapeProperties metricsConfig) {
    int port = Optional.ofNullable(metricsConfig.getPort()).orElse(DEFAULT_EXPORTER_PORT);
    boolean sslEnabled = metricsConfig.isSsl() || metricsConfig.getKeystoreConfig() != null;
    var request = webClient.get()
        .uri(UriComponentsBuilder.newInstance()
            .scheme(sslEnabled ? "https" : "http")
            .host(host)
            .port(port)
            .path(METRICS_ENDPOINT_PATH).build().toUri());

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
