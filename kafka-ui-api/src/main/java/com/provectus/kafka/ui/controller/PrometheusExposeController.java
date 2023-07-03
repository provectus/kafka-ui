package com.provectus.kafka.ui.controller;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.google.common.collect.Iterators;
import com.provectus.kafka.ui.api.PrometheusExposeApi;
import com.provectus.kafka.ui.service.StatisticsCache;
import io.prometheus.client.exporter.common.TextFormat;
import java.io.StringWriter;
import java.io.Writer;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PrometheusExposeController extends AbstractController implements PrometheusExposeApi {

  private final StatisticsCache statisticsCache;

  @Override
  public Mono<ResponseEntity<String>> getAllMetrics(String clusterName, ServerWebExchange exchange) {
    return constructResponse(
        statisticsCache.get(getCluster(clusterName))
            .getMetrics()
            .getSummarizedBrokersMetrics()
    );
  }

  @Override
  public Mono<ResponseEntity<String>> getBrokerMetrics(String clusterName,
                                                       Long brokerId,
                                                       ServerWebExchange exchange) {
    return constructResponse(
        statisticsCache.get(getCluster(clusterName))
            .getMetrics()
            .getPerBrokerScrapedMetrics()
            .getOrDefault(brokerId.intValue(), List.of())
            .stream()
    );
  }

  @SneakyThrows
  private Mono<ResponseEntity<String>> constructResponse(Stream<MetricFamilySamples> metrics) {
    Writer writer = new StringWriter();
    TextFormat.writeOpenMetrics100(writer, Iterators.asEnumeration(metrics.iterator()));

    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.set(HttpHeaders.CONTENT_TYPE, TextFormat.CONTENT_TYPE_OPENMETRICS_100);

    return Mono.just(
        ResponseEntity
            .ok()
            .headers(responseHeaders)
            .body(writer.toString())
    );
  }

}
