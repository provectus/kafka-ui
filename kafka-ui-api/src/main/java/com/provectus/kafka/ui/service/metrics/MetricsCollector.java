package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.MetricsConfig;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Component
@Slf4j
@RequiredArgsConstructor
public class MetricsCollector {

  private final JmxMetricsRetriever jmxMetricsRetriever;
  private final PrometheusMetricsRetriever prometheusMetricsRetriever;

  public Mono<Metrics> getBrokerMetrics(KafkaCluster cluster, Collection<Node> nodes) {
    return Flux.fromIterable(nodes)
        .flatMap(n -> getMetrics(cluster, n).map(lst -> Tuples.of(n, lst)))
        .collectMap(Tuple2::getT1, Tuple2::getT2)
        .map(nodeMetrics -> collectMetrics(cluster, nodeMetrics))
        .defaultIfEmpty(Metrics.empty());
  }

  private Mono<List<RawMetric>> getMetrics(KafkaCluster kafkaCluster, Node node) {
    Flux<RawMetric> metricFlux = Flux.empty();
    if (kafkaCluster.getMetricsConfig() != null) {
      String type = kafkaCluster.getMetricsConfig().getType();
      if (type == null || type.equalsIgnoreCase(MetricsConfig.JMX_METRICS_TYPE)) {
        metricFlux = jmxMetricsRetriever.retrieve(kafkaCluster, node);
      } else if (type.equalsIgnoreCase(MetricsConfig.PROMETHEUS_METRICS_TYPE)) {
        metricFlux = prometheusMetricsRetriever.retrieve(kafkaCluster, node);
      }
    }
    return metricFlux.collectList();
  }

  public Metrics collectMetrics(KafkaCluster cluster, Map<Node, List<RawMetric>> perBrokerMetrics) {
    Metrics.MetricsBuilder builder = Metrics.builder()
        .perBrokerMetrics(
            perBrokerMetrics.entrySet()
                .stream()
                .collect(Collectors.toMap(e -> e.getKey().id(), Map.Entry::getValue)));

    populateWellknowMetrics(cluster, perBrokerMetrics)
        .apply(builder);

    return builder.build();
  }

  private WellKnownMetrics populateWellknowMetrics(KafkaCluster cluster, Map<Node, List<RawMetric>> perBrokerMetrics) {
    WellKnownMetrics wellKnownMetrics = new WellKnownMetrics();
    perBrokerMetrics.forEach((node, metrics) ->
        metrics.forEach(metric ->
            wellKnownMetrics.populate(node, metric)));
    return wellKnownMetrics;
  }

}
