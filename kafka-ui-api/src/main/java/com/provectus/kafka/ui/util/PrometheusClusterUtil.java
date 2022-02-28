package com.provectus.kafka.ui.util;

import com.google.common.net.HttpHeaders;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
public class PrometheusClusterUtil {
  private final WebClient webClient;

  public Mono<PrometheusMetricsDTO> getBrokerMetrics() {
    return webClient.post()
        .uri("localhost:9090/api/v1/query")
        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
        .body(BodyInserters.fromFormData("query", "{__name__=~\"kafka_server.*\"}"))
        .retrieve()
        .bodyToMono(PrometheusMetricsDTO.class)
        .onErrorReturn(new PrometheusMetricsDTO());
  }

}
