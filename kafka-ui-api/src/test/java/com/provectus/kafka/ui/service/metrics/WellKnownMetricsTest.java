package com.provectus.kafka.ui.service.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import java.math.BigDecimal;
import java.util.Map;
import org.apache.kafka.common.Node;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class WellKnownMetricsTest {

  private final WellKnownMetrics wellKnownMetrics = new WellKnownMetrics();

  @ParameterizedTest
  @CsvSource({
      //default jmx exporter format
      //example: kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name="BytesInPerSec",topic="test-topic",} 222.0
      //example: kafka_server_BrokerTopicMetrics_FifteenMinuteRate{name="BytesOutPerSec",topic="test-topic",} 111.0
      "kafka_server_BrokerTopicMetrics_FifteenMinuteRate, BytesInPerSec, BytesOutPerSec",

      //default jmx exporter format, but lower-cased
      //example: kafka_server_brokertopicmetrics_fifteenminuterate{name="bytesinpersec",topic="test-topic",} 222.0
      //example: kafka_server_brokertopicmetrics_fifteenminuterate{name="bytesoutpersec",topic="test-topic",} 111.0
      "kafka_server_brokertopicmetrics_fifteenminuterate, bytesinpersec, bytesoutpersec",

      //unknown prefix metric name
      "some_unknown_prefix_brokertopicmetrics_fifteenminuterate, bytesinpersec, bytesoutpersec",
  })
  void bytesIoTopicMetricsPopulated(String metricName, String bytesInLabel, String bytesOutLabel) {
    var clusterParam = KafkaCluster.builder().build();
    var nodeParam = new Node(0, "host", 123);

    var in = RawMetric.create(metricName, Map.of("name", bytesInLabel, "topic", "test-topic"), new BigDecimal("1.0"));
    var out = RawMetric.create(metricName, Map.of("name", bytesOutLabel, "topic", "test-topic"), new BigDecimal("2.0"));

    // feeding metrics
    for (int i = 0; i < 3; i++) {
      wellKnownMetrics.populate(clusterParam, nodeParam, in);
      wellKnownMetrics.populate(clusterParam, nodeParam, out);
    }

    assertThat(wellKnownMetrics.bytesInFifteenMinuteRate)
        .containsEntry("test-topic", new BigDecimal("3.0"));

    assertThat(wellKnownMetrics.bytesOutFifteenMinuteRate)
        .containsEntry("test-topic", new BigDecimal("6.0"));
  }

  @Test
  void appliesInnerStateToMetricsBuilder() {
    wellKnownMetrics.bytesInFifteenMinuteRate.put("topic", new BigDecimal(1));
    wellKnownMetrics.bytesOutFifteenMinuteRate.put("topic", new BigDecimal(2));

    Metrics.MetricsBuilder builder = Metrics.builder();
    wellKnownMetrics.apply(builder);
    var metrics = builder.build();

    assertThat(metrics.getBytesInPerSec()).containsExactlyEntriesOf(wellKnownMetrics.bytesInFifteenMinuteRate);
    assertThat(metrics.getBytesOutPerSec()).containsExactlyEntriesOf(wellKnownMetrics.bytesOutFifteenMinuteRate);
  }

}