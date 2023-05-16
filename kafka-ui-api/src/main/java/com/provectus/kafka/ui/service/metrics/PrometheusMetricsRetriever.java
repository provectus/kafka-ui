package com.provectus.kafka.ui.service.metrics;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.util.Arrays;
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
class PrometheusMetricsRetriever implements MetricsRetriever {

  private static final String METRICS_ENDPOINT_PATH = "/metrics";
  private static final int DEFAULT_EXPORTER_PORT = 11001;

  @Override
  public Flux<RawMetric> retrieve(KafkaCluster c, Node node) {
    log.debug("Retrieving metrics from prometheus exporter: {}:{}", node.host(), c.getMetricsConfig().getPort());

    MetricsConfig metricsConfig = c.getMetricsConfig();
    var webClient = new WebClientConfigurator()
        .configureBufferSize(DataSize.ofMegabytes(20))
        .configureBasicAuth(metricsConfig.getUsername(), metricsConfig.getPassword())
        .configureSsl(
            c.getOriginalProperties().getSsl(),
            new ClustersProperties.KeystoreConfig(
                metricsConfig.getKeystoreLocation(),
                metricsConfig.getKeystorePassword()))
        .build();

    return retrieve(webClient, node.host(), c.getMetricsConfig());
  }

  @VisibleForTesting
  Flux<RawMetric> retrieve(WebClient webClient, String host, MetricsConfig metricsConfig) {
    int port = Optional.ofNullable(metricsConfig.getPort()).orElse(DEFAULT_EXPORTER_PORT);
    boolean sslEnabled = metricsConfig.isSsl() || metricsConfig.getKeystoreLocation() != null;
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
