package com.provectus.kafka.ui.service.metrics;

import com.google.common.base.Strings;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Arrays;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
class PrometheusMetricsRetriever implements MetricsRetriever {

  private final WebClient webClient;

  @Override
  public Flux<RawMetric> retrieve(KafkaCluster c, Node node) {
    log.debug("Retrieving metrics from prometheus exporter: {}:{}", node.host(), c.getMetricsConfig().getPort());
    var metricsConfig = c.getMetricsConfig();
    WebClient.ResponseSpec responseSpec = webClient.get()
        .uri(UriComponentsBuilder.newInstance()
            .scheme(metricsConfig.isSsl() ? "https" : "http")
            .host(node.host())
            .port(metricsConfig.getPort())
            .path("/metrics").build().toUri())
        .retrieve();

    //TODO: read line by line, not entire body at once
    return responseSpec.bodyToMono(String.class)
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
