package com.provectus.kafka.ui.service.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import javax.management.MBeanAttributeInfo;
import javax.management.ObjectName;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.Test;

class JmxMetricsFormatterTest {

  /**
   * Original format is <a href="https://github.com/prometheus/jmx_exporter#default-format">here</a>.
   */
  @Test
  void convertsJmxMetricsAccordingToJmxExporterFormat() throws Exception {
    List<RawMetric> metrics = JmxMetricsFormatter.constructMetricsList(
        new ObjectName(
            "kafka.server:type=Some.BrokerTopic-Metrics,name=BytesOutPer-Sec,topic=test,some-lbl=123"),
        new MBeanAttributeInfo[] {
            createMbeanInfo("FifteenMinuteRate"),
            createMbeanInfo("Mean"),
            createMbeanInfo("Calls-count"),
            createMbeanInfo("SkipValue"),
        },
        new Object[] {
            123.0,
            100.0,
            10L,
            "string values not supported"
        }
    );

    assertThat(metrics).hasSize(3);

    assertMetricsEqual(
        RawMetric.create(
            "kafka_server_Some_BrokerTopic_Metrics_FifteenMinuteRate",
            Map.of("name", "BytesOutPer-Sec", "topic", "test",  "some_lbl", "123"),
            BigDecimal.valueOf(123.0)
        ),
        metrics.get(0)
    );

    assertMetricsEqual(
        RawMetric.create(
            "kafka_server_Some_BrokerTopic_Metrics_Mean",
            Map.of("name", "BytesOutPer-Sec", "topic", "test", "some_lbl", "123"),
            BigDecimal.valueOf(100.0)
        ),
        metrics.get(1)
    );

    assertMetricsEqual(
        RawMetric.create(
            "kafka_server_Some_BrokerTopic_Metrics_Calls_count",
            Map.of("name", "BytesOutPer-Sec", "topic", "test", "some_lbl", "123"),
            BigDecimal.valueOf(10)
        ),
        metrics.get(2)
    );
  }

  private static MBeanAttributeInfo createMbeanInfo(String name) {
    return new MBeanAttributeInfo(name, "sometype-notused", null, true, true, false, null);
  }

  private void assertMetricsEqual(RawMetric expected, RawMetric actual) {
    assertThat(actual.name()).isEqualTo(expected.name());
    assertThat(actual.labels()).isEqualTo(expected.labels());
    assertThat(actual.value()).isCloseTo(expected.value(), Offset.offset(new BigDecimal("0.001")));
  }

}