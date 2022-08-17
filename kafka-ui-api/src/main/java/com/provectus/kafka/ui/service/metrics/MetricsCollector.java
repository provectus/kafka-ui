package com.provectus.kafka.ui.service.metrics;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.reducing;
import static java.util.stream.Collectors.toList;

import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.MetricsConfig;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
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
        // jmx is a blocking api, so we trying to parallelize its execution on boundedElastic scheduler
        .parallel()
        .runOn(Schedulers.boundedElastic())
        .map(n -> Map.entry(n.id(),
            BrokerMetrics.builder().metrics(getMetrics(cluster, n)).build()))
        .sequential()
        .collectMap(Map.Entry::getKey, Map.Entry::getValue)
        .map(this::collectMetrics);
  }

  private List<MetricDTO> getMetrics(KafkaCluster kafkaCluster, Node node) {
    if (kafkaCluster.getMetricsConfig() != null) {
      String type = kafkaCluster.getMetricsConfig().getType();
      if (type == null || type.equals(MetricsConfig.JMX_METRICS_TYPE)) {
        return jmxMetricsRetriever.retrieve(kafkaCluster, node);
      } else if (type.equals(MetricsConfig.PROMETHEUS_METRICS_TYPE)) {
        return prometheusMetricsRetriever.retrieve(kafkaCluster, node);
      } else {
        return Collections.emptyList();
      }
    } else {
      return Collections.emptyList();
    }
  }

  public Metrics collectMetrics(Map<Integer, BrokerMetrics> perBrokerMetrics) {
    List<MetricDTO> metrics = perBrokerMetrics.values()
        .stream()
        .flatMap(b -> b.getMetrics().stream())
        .collect(
            groupingBy(
                dto -> dto.getCanonicalName() + dto.getName(),
                reducing(this::reduceMetrics)
            )
        ).values().stream()
        .filter(Optional::isPresent)
        .map(Optional::get)
        .collect(toList());
    return Metrics.builder()
        .metrics(metrics)
        .internalBrokerMetrics(perBrokerMetrics)
        .bytesInPerSec(findTopicMetrics(
            metrics, MetricsName.BYTES_IN_PER_SEC, MetricsValueName.FIFTEEN_MINUTE_RATE))
        .bytesOutPerSec(findTopicMetrics(
            metrics, MetricsName.BYTES_OUT_PER_SEC, MetricsValueName.FIFTEEN_MINUTE_RATE))
        .build();
  }

  private Map<String, BigDecimal> findTopicMetrics(List<MetricDTO> metrics,
                                                   MetricsName metricsName,
                                                   MetricsValueName valueName) {
    return metrics.stream()
        .filter(m -> metricsName.getValue().equals(m.getName()))
        .filter(m -> m.getParams().containsKey("topic"))
        .filter(m -> m.getValue().containsKey(valueName.getValue()))
        .map(m -> Tuples.of(
            m.getParams().get("topic"),
            m.getValue().get(valueName.getValue())
        )).collect(groupingBy(
            Tuple2::getT1,
            reducing(BigDecimal.ZERO, Tuple2::getT2, BigDecimal::add)
        ));
  }


  public MetricDTO reduceMetrics(MetricDTO metric1, MetricDTO metric2) {
    var result = new MetricDTO();
    Map<String, BigDecimal> value = Stream.concat(
        metric1.getValue().entrySet().stream(),
        metric2.getValue().entrySet().stream()
    ).collect(Collectors.groupingBy(
        Map.Entry::getKey,
        Collectors.reducing(BigDecimal.ZERO, Map.Entry::getValue, BigDecimal::add)
    ));
    result.setName(metric1.getName());
    result.setCanonicalName(metric1.getCanonicalName());
    result.setParams(metric1.getParams());
    result.setValue(value);
    return result;
  }

}
