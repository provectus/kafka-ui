package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.PrometheusExposeApi;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.StatisticsCache;
import com.provectus.kafka.ui.service.metrics.prometheus.PrometheusExpose;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PrometheusExposeController extends AbstractController implements PrometheusExposeApi {

  private final StatisticsCache statisticsCache;

  @Override
  public Mono<ResponseEntity<String>> getAllMetrics(ServerWebExchange exchange) {
    return Mono.just(
        PrometheusExpose.exposeAllMetrics(
            clustersStorage.getKafkaClusters()
                .stream()
                .filter(KafkaCluster::isExposeMetricsViaPrometheusEndpoint)
                .collect(Collectors.toMap(KafkaCluster::getName, c -> statisticsCache.get(c).getMetrics()))
        )
    );
  }

  @Override
  public Mono<ResponseEntity<String>> getAllClusterMetrics(String clusterName, ServerWebExchange exchange) {
    var cluster = getCluster(clusterName);
    if (!cluster.isExposeMetricsViaPrometheusEndpoint()) {
      return Mono.empty();
    }
    return Mono.just(
        PrometheusExpose.exposeClusterMetrics(
            statisticsCache.get(cluster).getMetrics()
        )
    );
  }

  @Override
  public Mono<ResponseEntity<String>> getBrokerMetrics(String clusterName,
                                                       Long brokerId,
                                                       ServerWebExchange exchange) {
    var cluster = getCluster(clusterName);
    if (!cluster.isExposeMetricsViaPrometheusEndpoint()) {
      return Mono.empty();
    }
    return Mono.just(
        PrometheusExpose.exposeBrokerMetrics(
            statisticsCache.get(cluster).getMetrics(), brokerId.intValue()
        )
    );
  }

}
