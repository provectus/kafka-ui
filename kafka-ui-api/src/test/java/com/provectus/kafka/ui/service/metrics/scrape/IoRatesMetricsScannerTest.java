package com.provectus.kafka.ui.service.metrics.scrape;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toMap;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.service.metrics.scrape.prometheus.PrometheusEndpointParser;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.apache.kafka.common.Node;
import org.junit.jupiter.api.Test;

class IoRatesMetricsScannerTest {

  private IoRatesMetricsScanner ioRatesMetricsScanner;

  @Test
  void bytesIoTopicMetricsPopulated() {
    populateWith(
        nodeMetrics(
            new Node(0, "host", 123),
            "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesInPerSec\",topic=\"test\",} 1.0",
            "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesOutPerSec\",topic=\"test\",} 2.0",
            "kafka_server_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",topic=\"test\",} 1.0",
            "kafka_server_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",topic=\"test\",} 2.0",
            "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",topic=\"test\",} 1.0",
            "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",topic=\"test\",} 2.0"
        )
    );
    assertThat(ioRatesMetricsScanner.bytesInFifteenMinuteRate)
        .containsEntry("test", new BigDecimal("3.0"));
    assertThat(ioRatesMetricsScanner.bytesOutFifteenMinuteRate)
        .containsEntry("test", new BigDecimal("6.0"));
  }

  @Test
  void bytesIoBrokerMetricsPopulated() {
    populateWith(
        nodeMetrics(
            new Node(1, "host1", 123),
            "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesInPerSec\",} 1.0",
            "kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name=\"BytesOutPerSec\",} 2.0"
        ),
        nodeMetrics(
            new Node(2, "host2", 345),
            "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesinpersec\",} 10.0",
            "some_unknown_prefix_brokertopicmetrics_fifteenminuterate{name=\"bytesoutpersec\",} 20.0"
        )
    );

    assertThat(ioRatesMetricsScanner.brokerBytesInFifteenMinuteRate)
        .hasSize(2)
        .containsEntry(1, new BigDecimal("1.0"))
        .containsEntry(2, new BigDecimal("10.0"));

    assertThat(ioRatesMetricsScanner.brokerBytesOutFifteenMinuteRate)
        .hasSize(2)
        .containsEntry(1, new BigDecimal("2.0"))
        .containsEntry(2, new BigDecimal("20.0"));
  }

  @SafeVarargs
  private void populateWith(Map.Entry<Integer, List<MetricFamilySamples>>... entries) {
    ioRatesMetricsScanner = new IoRatesMetricsScanner(
        stream(entries).collect(toMap(Map.Entry::getKey, Map.Entry::getValue))
    );
  }

  private Map.Entry<Integer, List<MetricFamilySamples>> nodeMetrics(Node n, String... prometheusMetrics) {
    return Map.entry(n.id(), PrometheusEndpointParser.parse(stream(prometheusMetrics)));
  }

}
