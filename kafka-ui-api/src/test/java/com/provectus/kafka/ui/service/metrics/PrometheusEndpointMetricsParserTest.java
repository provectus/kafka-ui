package com.provectus.kafka.ui.service.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class PrometheusEndpointMetricsParserTest {

  @Test
  void test() {
    String metricsString =
        "kafka_server_BrokerTopicMetrics_FifteenMinuteRate"
            + "{name=\"BytesOutPerSec\",topic=\"__confluent.support.metrics\",} 123.1234";

    Optional<RawMetric> parsedOpt = PrometheusEndpointMetricsParser.parse(metricsString);

    assertThat(parsedOpt).hasValueSatisfying(metric -> {
      assertThat(metric.name()).isEqualTo("kafka_server_BrokerTopicMetrics_FifteenMinuteRate");
      assertThat(metric.value()).isEqualTo("123.1234");
      assertThat(metric.labels()).containsExactlyEntriesOf(
          Map.of(
              "name", "BytesOutPerSec",
              "topic", "__confluent.support.metrics"
          ));
    });
  }

}