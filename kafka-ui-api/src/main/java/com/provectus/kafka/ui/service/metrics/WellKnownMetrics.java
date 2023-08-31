package com.provectus.kafka.ui.service.metrics;

import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;
import static org.apache.commons.lang3.StringUtils.endsWithIgnoreCase;

import com.provectus.kafka.ui.model.Metrics;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.common.Node;

class WellKnownMetrics {

  private static final String BROKER_TOPIC_METRICS = "BrokerTopicMetrics";
  private static final String FIFTEEN_MINUTE_RATE = "FifteenMinuteRate";

  // per broker
  final Map<Integer, BigDecimal> brokerBytesInFifteenMinuteRate = new HashMap<>();
  final Map<Integer, BigDecimal> brokerBytesOutFifteenMinuteRate = new HashMap<>();

  // per topic
  final Map<String, BigDecimal> bytesInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> bytesOutFifteenMinuteRate = new HashMap<>();

  void populate(Node node, RawMetric rawMetric) {
    updateBrokerIOrates(node, rawMetric);
    updateTopicsIOrates(rawMetric);
  }

  void apply(Metrics.MetricsBuilder metricsBuilder) {
    metricsBuilder.topicBytesInPerSec(bytesInFifteenMinuteRate);
    metricsBuilder.topicBytesOutPerSec(bytesOutFifteenMinuteRate);
    metricsBuilder.brokerBytesInPerSec(brokerBytesInFifteenMinuteRate);
    metricsBuilder.brokerBytesOutPerSec(brokerBytesOutFifteenMinuteRate);
  }

  private void updateBrokerIOrates(Node node, RawMetric rawMetric) {
    String name = rawMetric.name();
    if (!brokerBytesInFifteenMinuteRate.containsKey(node.id())
        && rawMetric.labels().size() == 1
        && "BytesInPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, BROKER_TOPIC_METRICS)
        && endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
      brokerBytesInFifteenMinuteRate.put(node.id(),  rawMetric.value());
    }
    if (!brokerBytesOutFifteenMinuteRate.containsKey(node.id())
        && rawMetric.labels().size() == 1
        && "BytesOutPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, BROKER_TOPIC_METRICS)
        && endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
      brokerBytesOutFifteenMinuteRate.put(node.id(), rawMetric.value());
    }
  }

  private void updateTopicsIOrates(RawMetric rawMetric) {
    String name = rawMetric.name();
    String topic = rawMetric.labels().get("topic");
    if (topic != null
        && containsIgnoreCase(name, BROKER_TOPIC_METRICS)
        && endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
      String nameProperty = rawMetric.labels().get("name");
      if ("BytesInPerSec".equalsIgnoreCase(nameProperty)) {
        bytesInFifteenMinuteRate.compute(topic, (k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
      } else if ("BytesOutPerSec".equalsIgnoreCase(nameProperty)) {
        bytesOutFifteenMinuteRate.compute(topic, (k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
      }
    }
  }

}
