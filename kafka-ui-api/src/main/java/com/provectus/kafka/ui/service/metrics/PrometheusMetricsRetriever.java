package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
class PrometheusMetricsRetriever implements MetricsRetriever {

  private final WebClient webClient;
  private final PrometheusEndpointMetricsParser parser;

  @Override
  public List<MetricDTO> retrieve(KafkaCluster c, Node node) {
    log.debug("Retrieving metrics from prometheus exporter: {}:{}", node.host(), c.getMetricsConfig().getPort());
    WebClient.ResponseSpec responseSpec = webClient.get()
        .uri(UriComponentsBuilder.newInstance()
            .scheme("http")
            .host(node.host())
            .port(c.getMetricsConfig().getPort())
            .path("/metrics").build().toUri())
        .retrieve();
    return Optional.ofNullable(responseSpec.bodyToMono(String.class).block())
        .map(body ->
            Arrays.stream(body.split("\\n"))
                .parallel()
                .filter(str -> str != null && !"".equals(str) && !str.startsWith("#"))
                .map(parser::parse)
                .filter(metrics -> metrics != null && metrics.getCanonicalName() != null)
                .collect(Collectors.toList()))
        .orElse(Collections.emptyList());
  }
}
