package com.provectus.kafka.ui.service.metrics.prometheus;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static io.prometheus.client.exporter.common.TextFormat.CONTENT_TYPE_OPENMETRICS_100;
import static org.springframework.http.HttpHeaders.CONTENT_TYPE;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Iterators;
import com.provectus.kafka.ui.model.Metrics;
import io.prometheus.client.exporter.common.TextFormat;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

public final class PrometheusExpose {

  private static final String CLUSTER_EXPOSE_LBL_NAME = "cluster";
  private static final String BROKER_EXPOSE_LBL_NAME = "broker_id";

  private static final HttpHeaders PROMETHEUS_EXPOSE_ENDPOINT_HEADERS;

  static {
    PROMETHEUS_EXPOSE_ENDPOINT_HEADERS = new HttpHeaders();
    PROMETHEUS_EXPOSE_ENDPOINT_HEADERS.set(CONTENT_TYPE, CONTENT_TYPE_OPENMETRICS_100);
  }

  private PrometheusExpose() {
  }

  public static ResponseEntity<String> exposeAllMetrics(Map<String, Metrics> clustersMetrics) {
    return constructHttpsResponse(getMetricsForGlobalExpose(clustersMetrics));
  }

  private static Stream<MetricFamilySamples> getMetricsForGlobalExpose(Map<String, Metrics> clustersMetrics) {
    return clustersMetrics.entrySet()
        .stream()
        .flatMap(e -> prepareMetricsForGlobalExpose(e.getKey(), e.getValue()))
        // merging MFS with same name with LinkedHashMap(for order keeping)
        .collect(Collectors.toMap(mfs -> mfs.name, mfs -> mfs,
            PrometheusExpose::concatSamples, LinkedHashMap::new))
        .values()
        .stream();
  }

  public static Stream<MetricFamilySamples> prepareMetricsForGlobalExpose(String clusterName, Metrics metrics) {
    return Stream.concat(
            metrics.getInferredMetrics().asStream(),
            extractBrokerMetricsWithLabel(metrics)
        )
        .map(mfs -> appendLabel(mfs, CLUSTER_EXPOSE_LBL_NAME, clusterName));
  }

  private static Stream<MetricFamilySamples> extractBrokerMetricsWithLabel(Metrics metrics) {
    return metrics.getPerBrokerScrapedMetrics().entrySet().stream()
        .flatMap(e -> {
          String brokerId = String.valueOf(e.getKey());
          return e.getValue().stream().map(mfs -> appendLabel(mfs, BROKER_EXPOSE_LBL_NAME, brokerId));
        });
  }

  private static MetricFamilySamples concatSamples(MetricFamilySamples mfs1,
                                                   MetricFamilySamples mfs2) {
    return new MetricFamilySamples(
        mfs1.name, mfs1.unit, mfs1.type, mfs1.help,
        Stream.concat(mfs1.samples.stream(), mfs2.samples.stream()).toList()
    );
  }

  private static MetricFamilySamples appendLabel(MetricFamilySamples mfs, String lblName, String lblVal) {
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

  @VisibleForTesting
  @SneakyThrows
  public static ResponseEntity<String> constructHttpsResponse(Stream<MetricFamilySamples> metrics) {
    StringWriter writer = new StringWriter();
    TextFormat.writeOpenMetrics100(writer, Iterators.asEnumeration(metrics.iterator()));
    return ResponseEntity
        .ok()
        .headers(PROMETHEUS_EXPOSE_ENDPOINT_HEADERS)
        .body(writer.toString());
  }

  // copied from io.prometheus.client.exporter.common.TextFormat:writeEscapedLabelValue
  public static String escapedLabelValue(String s) {
    StringBuilder sb = new StringBuilder(s.length());
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '\\' -> sb.append("\\\\");
        case '\"' -> sb.append("\\\"");
        case '\n' -> sb.append("\\n");
        default -> sb.append(c);
      }
    }
    return sb.toString();
  }

}
