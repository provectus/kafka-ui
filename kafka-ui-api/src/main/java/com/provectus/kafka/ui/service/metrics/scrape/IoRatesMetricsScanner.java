package com.provectus.kafka.ui.service.metrics.scrape;

import static io.prometheus.client.Collector.*;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;
import static org.apache.commons.lang3.StringUtils.endsWithIgnoreCase;

import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import io.prometheus.client.Collector;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Scans external jmx/prometheus metric and tries to infer io rates
class IoRatesMetricsScanner {

  // per broker
  final Map<Integer, BigDecimal> brokerBytesInFifteenMinuteRate = new HashMap<>();
  final Map<Integer, BigDecimal> brokerBytesOutFifteenMinuteRate = new HashMap<>();

  // per topic
  final Map<String, BigDecimal> bytesInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> bytesOutFifteenMinuteRate = new HashMap<>();

  IoRatesMetricsScanner(Map<Integer, List<MetricFamilySamples>> perBrokerMetrics) {
    perBrokerMetrics.forEach((nodeId, metrics) -> {
      metrics.forEach(m -> {
        m.samples.forEach(metricSample -> {
          updateBrokerIOrates(nodeId, metricSample);
          updateTopicsIOrates(metricSample);
        });
      });
    });
  }

  public Metrics.IoRates get() {
    return Metrics.IoRates.builder()
        .topicBytesInPerSec(bytesInFifteenMinuteRate)
        .topicBytesOutPerSec(bytesOutFifteenMinuteRate)
        .brokerBytesInPerSec(brokerBytesInFifteenMinuteRate)
        .brokerBytesOutPerSec(brokerBytesOutFifteenMinuteRate)
        .build();
  }

  private void updateBrokerIOrates(int nodeId, MetricFamilySamples.Sample metric) {
    String name = metric.name;
    if (!brokerBytesInFifteenMinuteRate.containsKey(nodeId)
        && metric.labelValues.size() == 1
        && "BytesInPerSec".equalsIgnoreCase(metric.labelValues.get(0))
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      brokerBytesInFifteenMinuteRate.put(nodeId, BigDecimal.valueOf(metric.value));
    }
    if (!brokerBytesOutFifteenMinuteRate.containsKey(nodeId)
        && metric.labelValues.size() == 1
        && "BytesOutPerSec".equalsIgnoreCase(metric.labelValues.get(0))
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      brokerBytesOutFifteenMinuteRate.put(nodeId, BigDecimal.valueOf(metric.value));
    }
  }

  private void updateTopicsIOrates(MetricFamilySamples.Sample metric) {
    String name = metric.name;
    int topicLblIdx = metric.labelNames.indexOf("topic");
    if (topicLblIdx >= 0
        && containsIgnoreCase(name, "BrokerTopicMetrics")
        && endsWithIgnoreCase(name, "FifteenMinuteRate")) {
      String topic = metric.labelValues.get(topicLblIdx);
      int nameLblIdx = metric.labelNames.indexOf("name");
      if (nameLblIdx >= 0) {
        var nameLblVal = metric.labelValues.get(nameLblIdx);
        if ("BytesInPerSec".equalsIgnoreCase(nameLblVal)) {
          BigDecimal val = BigDecimal.valueOf(metric.value);
          bytesInFifteenMinuteRate.merge(topic, val, BigDecimal::add);
        } else if ("BytesOutPerSec".equalsIgnoreCase(nameLblVal)) {
          BigDecimal val = BigDecimal.valueOf(metric.value);
          bytesOutFifteenMinuteRate.merge(topic, val, BigDecimal::add);
        }
      }
    }
  }

}
