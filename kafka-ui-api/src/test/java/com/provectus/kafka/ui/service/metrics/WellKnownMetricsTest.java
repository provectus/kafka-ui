package com.provectus.kafka.ui.service.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.Metrics;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.apache.kafka.common.Node;
import org.junit.jupiter.api.Test;

class WellKnownMetricsTest {

  private final WellKnownMetrics wellKnownMetrics = new WellKnownMetrics();

  @Test
  void bytesIoTopicMetricsPopulated() {
    populateWith(
        new Node(0, "host", 123),
        "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesInPerSec\",topic=\"test-topic\",} 1.0",
        "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesOutPerSec\",topic=\"test-topic\",} 2.0",
        "kafka_server_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",topic=\"test-topic\",} 1.0",
        "kafka_server_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",topic=\"test-topic\",} 2.0",
        "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",topic=\"test-topic\",} 1.0",
        "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",topic=\"test-topic\",} 2.0"
    );
    assertThat(wellKnownMetrics.bytesInFifteenMinuteRate)
        .containsEntry("test-topic", new BigDecimal("3.0"));
    assertThat(wellKnownMetrics.bytesOutFifteenMinuteRate)
        .containsEntry("test-topic", new BigDecimal("6.0"));
  }

  @Test
  void bytesIoBrokerMetricsPopulated() {
    populateWith(
        new Node(1, "host1", 123),
        "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesInPerSec\",} 1.0",
        "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesOutPerSec\",} 2.0"
    );
    populateWith(
        new Node(2, "host2", 345),
        "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",} 10.0",
        "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",} 20.0"
    );

    assertThat(wellKnownMetrics.brokerBytesInFifteenMinuteRate)
        .hasSize(2)
        .containsEntry(1, new BigDecimal("1.0"))
        .containsEntry(2, new BigDecimal("10.0"));

    assertThat(wellKnownMetrics.brokerBytesOutFifteenMinuteRate)
        .hasSize(2)
        .containsEntry(1, new BigDecimal("2.0"))
        .containsEntry(2, new BigDecimal("20.0"));
  }

  @Test
  void appliesInnerStateToMetricsBuilder() {
    //filling per topic io rates
    wellKnownMetrics.bytesInFifteenMinuteRate.put("topic", new BigDecimal(1));
    wellKnownMetrics.bytesOutFifteenMinuteRate.put("topic", new BigDecimal(2));

    //filling per broker io rates
    wellKnownMetrics.brokerBytesInFifteenMinuteRate.put(1, new BigDecimal(1));
    wellKnownMetrics.brokerBytesOutFifteenMinuteRate.put(1, new BigDecimal(2));
    wellKnownMetrics.brokerBytesInFifteenMinuteRate.put(2, new BigDecimal(10));
    wellKnownMetrics.brokerBytesOutFifteenMinuteRate.put(2, new BigDecimal(20));

    Metrics.MetricsBuilder builder = Metrics.builder();
    wellKnownMetrics.apply(builder);
    var metrics = builder.build();

    // checking per topic io rates
    assertThat(metrics.getTopicBytesInPerSec()).containsExactlyEntriesOf(wellKnownMetrics.bytesInFifteenMinuteRate);
    assertThat(metrics.getTopicBytesOutPerSec()).containsExactlyEntriesOf(wellKnownMetrics.bytesOutFifteenMinuteRate);

    // checking per broker io rates
    assertThat(metrics.getBrokerBytesInPerSec()).containsExactlyInAnyOrderEntriesOf(
        Map.of(1, new BigDecimal(1), 2, new BigDecimal(10)));
    assertThat(metrics.getBrokerBytesOutPerSec()).containsExactlyInAnyOrderEntriesOf(
        Map.of(1, new BigDecimal(2), 2, new BigDecimal(20)));
  }

  private void populateWith(Node n, String... prometheusMetric) {
    Arrays.stream(prometheusMetric)
        .map(PrometheusEndpointMetricsParser::parse)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .forEach(m -> wellKnownMetrics.populate(n, m));
  }

}