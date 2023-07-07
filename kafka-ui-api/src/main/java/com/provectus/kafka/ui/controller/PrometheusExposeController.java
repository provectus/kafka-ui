package com.provectus.kafka.ui.controller;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.google.common.collect.Iterators;
import com.provectus.kafka.ui.api.PrometheusExposeApi;
import com.provectus.kafka.ui.service.StatisticsCache;
import io.prometheus.client.exporter.common.TextFormat;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
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
  public Mono<ResponseEntity<String>> getAllMetrics(ServerWebExchange exchange) {
    return constructResponse(getSummarizedMetricsWithClusterLbl());
  }

  @Override
  public Mono<ResponseEntity<String>> getAllClusterMetrics(String clusterName, ServerWebExchange exchange) {
    return constructResponse(
        statisticsCache.get(getCluster(clusterName))
            .getMetrics()
            .getSummarizedMetrics()
    );
  }

  @Override
  public Mono<ResponseEntity<String>> getBrokerMetrics(String clusterName,
                                                       Long brokerId,
                                                       ServerWebExchange exchange) {
    //TODO: discuss - do we need to append broker_id lbl ?
    return constructResponse(
        statisticsCache.get(getCluster(clusterName))
            .getMetrics()
            .getPerBrokerScrapedMetrics()
            .getOrDefault(brokerId.intValue(), List.of())
            .stream()
    );
  }

  private Stream<MetricFamilySamples> getSummarizedMetricsWithClusterLbl() {
    return clustersStorage.getKafkaClusters()
        .stream()
        .flatMap(c -> statisticsCache.get(c)
            .getMetrics()
            .getSummarizedMetrics()
            .map(mfs -> appendLbl(mfs, "cluster", c.getName())))
        // merging MFS with same name
        .collect(Collectors.toMap(mfs -> mfs.name, mfs -> mfs, PrometheusExposeController::merge))
        .values()
        .stream();
  }

  private static MetricFamilySamples merge(MetricFamilySamples mfs1, MetricFamilySamples mfs2) {
    return new MetricFamilySamples(
        mfs1.name, mfs1.unit, mfs1.type, mfs1.help,
        Stream.concat(mfs1.samples.stream(), mfs2.samples.stream()).toList()
    );
  }

  private static MetricFamilySamples appendLbl(MetricFamilySamples mfs, String lblName, String lblVal) {
    return new MetricFamilySamples(
        mfs.name, mfs.unit, mfs.type, mfs.help,
        mfs.samples.stream()
            .map(sample ->
                new MetricFamilySamples.Sample(
                    sample.name,
                    prependToList(sample.labelNames, lblName),
                    prependToList(sample.labelValues, lblVal),
                    sample.value
                )).toList()
    );
  }

  private static <T> List<T> prependToList(List<T> lst, T toPrepend) {
    var result = new ArrayList<T>(lst.size() + 1);
    result.add(toPrepend);
    result.addAll(lst);
    return result;
  }

  @SneakyThrows
  private static Mono<ResponseEntity<String>> constructResponse(Stream<MetricFamilySamples> metrics) {
    StringWriter writer = new StringWriter();
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
