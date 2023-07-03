package com.provectus.kafka.ui.service.metrics.scrape;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.apache.kafka.common.Node;
import org.junit.jupiter.api.Test;

class WellKnownMetricsTest {

  private WellKnownMetrics wellKnownMetrics;

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

  private void populateWith(Node n, String... prometheusMetric) {
    //TODO: uncomment
//    wellKnownMetrics = new WellKnownMetrics(
//        Arrays.stream(prometheusMetric)
//        .map(PrometheusEndpointMetricsParser::parse)
//        .filter(Optional::isPresent)
//        .map(Optional::get)
//    );
  }

}
