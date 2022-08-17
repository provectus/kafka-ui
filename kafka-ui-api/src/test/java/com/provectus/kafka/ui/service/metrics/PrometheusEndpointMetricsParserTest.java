package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.MetricDTO;
import java.math.BigDecimal;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PrometheusEndpointMetricsParserTest {

  private final PrometheusEndpointMetricsParser parser = new PrometheusEndpointMetricsParser();

  @Test
  void correctMetricsTest() {
    MetricDTO metric = parser.parse(
        "kafka_cluster_Partition_Value{name=\"InSyncReplicasCount\","
            + "topic=\"__consumer_offsets\",partition=\"37\",} 13.555");
    MatcherAssert.assertThat("should be correct canonical name", metric.getCanonicalName(),
        Matchers.is("Value"));
    MatcherAssert.assertThat("should be correct name", metric.getName(),
        Matchers.is("InSyncReplicasCount"));
    MatcherAssert.assertThat("should contain correct value", metric.getValue(),
        Matchers.hasEntry(Matchers.is("value"), Matchers.is(new BigDecimal("13.555"))));
    MatcherAssert.assertThat("should contain all properties", metric.getParams(), Matchers.allOf(
        Matchers.hasEntry(Matchers.is("topic"), Matchers.is("__consumer_offsets")),
        Matchers.hasEntry(Matchers.is("partition"), Matchers.is("37"))
    ));
  }

  @Test
  void tabsInsteadOfSpacesTest() {
    MetricDTO metric = parser.parse(
        "kafka_cluster_Partition_Value  {name=\"InSyncReplicasCount\","
            + "  topic=\"__consumer_offsets\", partition=\"37\",}  13.555");
    MatcherAssert.assertThat("should be correct canonical name", metric.getCanonicalName(),
        Matchers.is("Value"));
    MatcherAssert.assertThat("should be correct name", metric.getName(), Matchers.is("InSyncReplicasCount"));
    MatcherAssert.assertThat("should contain correct value", metric.getValue(),
        Matchers.hasEntry(Matchers.is("value"), Matchers.is(new BigDecimal("13.555"))));
    MatcherAssert.assertThat("should contain all properties", metric.getParams(), Matchers.allOf(
        Matchers.hasEntry(Matchers.is("topic"), Matchers.is("__consumer_offsets")),
        Matchers.hasEntry(Matchers.is("partition"), Matchers.is("37"))
    ));
  }

  @ParameterizedTest
  @ValueSource(strings = {
      "kafka_cluster_Partition_Value{name=\"InSyncReplicasCount\","
          + "topic=\"__consumer_offsets\",partition=\"37\",} NaN",
      "#kafka_cluster_Partition_Value{name=\"InSyncReplicasCount\","
          + "topic=\"__consumer_offsets\",partition=\"37\",} 13.555",
      "kafka_server_socket_server_metrics_connection_creation_total{listener=\"REPLICATION\","
          + "networkProcessor=\"8\",} 0.0",
      "kafka_cluster_Partition_Value{name=\"InSyncReplicasCount\",topic=\"__consumer_offsets\",partition=\"37\",}"
  })
  void incorrectMerticsTest(String metric) {
    MatcherAssert.assertThat("should be null", parser.parse(metric), Matchers.nullValue());
  }
}