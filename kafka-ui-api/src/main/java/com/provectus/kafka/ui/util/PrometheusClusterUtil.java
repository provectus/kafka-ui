package com.provectus.kafka.ui.util;

import com.google.common.net.HttpHeaders;
import com.provectus.kafka.ui.model.KafkaCluster;
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
  private static final String DEFAULT_BYTES_IN_OUT_PER_SEC_ONLY
      = "{__name__=~\"kafka_server_.*BrokerTopicMetrics_.*\","
      + "topic=~\"\"," // We don't need to summarize each topics metrics
      + "name=~\"Bytes(In|Out)PerSec\"}";

  public Mono<PrometheusMetrics> getBrokerMetrics(KafkaCluster cluster) {
    return webClient
        .post()
        .uri(cluster.getPrometheus() + "/api/v1/query")
        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
        .body(BodyInserters.fromFormData("query", DEFAULT_BYTES_IN_OUT_PER_SEC_ONLY))
        .retrieve()
        .bodyToMono(PrometheusMetrics.class)
        .onErrorReturn(new PrometheusMetrics());
  }
}
