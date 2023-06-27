package com.provectus.kafka.ui.service.metrics.v2.scrape;

import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;
import static org.apache.commons.lang3.StringUtils.endsWithIgnoreCase;

import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import io.prometheus.client.Collector;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.kafka.common.Node;

public class WellKnownMetrics {

  // per broker
  final Map<Integer, BigDecimal> brokerBytesInFifteenMinuteRate = new HashMap<>();
  final Map<Integer, BigDecimal> brokerBytesOutFifteenMinuteRate = new HashMap<>();

  // per topic
  final Map<String, BigDecimal> bytesInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> bytesOutFifteenMinuteRate = new HashMap<>();

  public WellKnownMetrics(Map<Integer, List<Collector.MetricFamilySamples>> perBrokerMetrics) {
    perBrokerMetrics.forEach((nodeId, metrics) -> {
      metrics.forEach(m -> {
        RawMetric.create(m).forEach(rawMetric -> {
          updateBrokerIOrates(nodeId, rawMetric);
          updateTopicsIOrates(rawMetric);
        });
      });
    });
  }

  public Metrics.IoRates ioRates() {
    return Metrics.IoRates.builder()
        .topicBytesInPerSec(bytesInFifteenMinuteRate)
        .topicBytesOutPerSec(bytesOutFifteenMinuteRate)
        .brokerBytesInPerSec(brokerBytesInFifteenMinuteRate)
        .brokerBytesOutPerSec(brokerBytesOutFifteenMinuteRate)
        .build();
  }

  private void updateBrokerIOrates(int nodeId, RawMetric rawMetric) {
    String name = rawMetric.name();
    if (!brokerBytesInFifteenMinuteRate.containsKey(nodeId)
        && rawMetric.labels().size() == 1
        && "BytesInPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      brokerBytesInFifteenMinuteRate.put(nodeId, rawMetric.value());
    }
    if (!brokerBytesOutFifteenMinuteRate.containsKey(nodeId)
        && rawMetric.labels().size() == 1
        && "BytesOutPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      brokerBytesOutFifteenMinuteRate.put(nodeId, rawMetric.value());
    }
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
