package com.provectus.kafka.ui.service.metrics;

import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;
import static org.apache.commons.lang3.StringUtils.endsWithIgnoreCase;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.common.Node;

class WellKnownMetrics {

  final Map<String, BigDecimal> bytesInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> bytesOutFifteenMinuteRate = new HashMap<>();

  void feed(KafkaCluster cluster, Node node, RawMetric rawMetric) {
    updateTopicsIOrates(rawMetric);
  }

  void apply(Metrics.MetricsBuilder metricsBuilder) {
    metricsBuilder.bytesInPerSec(bytesInFifteenMinuteRate);
    metricsBuilder.bytesOutPerSec(bytesOutFifteenMinuteRate);
  }

  private void updateTopicsIOrates(RawMetric rawMetric) {
    String name = rawMetric.name();
    String topic = rawMetric.labels().get("topic");
    if (topic != null
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      String nameProperty = rawMetric.labels().get("name");
      if ("BytesInPerSec".equalsIgnoreCase(nameProperty)) {
        bytesInFifteenMinuteRate.compute(topic, (k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
      } else if ("BytesOutPerSec".equalsIgnoreCase(nameProperty)) {
        bytesOutFifteenMinuteRate.compute(topic, (k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
      }
    }
  }

}
