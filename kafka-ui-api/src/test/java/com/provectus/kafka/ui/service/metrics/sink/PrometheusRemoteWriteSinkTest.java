package com.provectus.kafka.ui.service.metrics.sink;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.container.PrometheusContainer;
import io.prometheus.client.Collector;
import io.prometheus.client.Collector.MetricFamilySamples;
import io.prometheus.client.Collector.MetricFamilySamples.Sample;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import prometheus.query.ApiClient;
import prometheus.query.api.PrometheusClientApi;
import prometheus.query.model.QueryResponse;

class PrometheusRemoteWriteSinkTest {

  private final PrometheusContainer prometheusContainer = new PrometheusContainer();

  @BeforeEach
  void startPromContainer() {
    prometheusContainer.start();
  }

  @AfterEach
  void stopPromContainer() {
    prometheusContainer.stop();
  }

  @Test
  void metricsPushedToPrometheus() {
    var sink = new PrometheusRemoteWriteSink(prometheusContainer.url(), null);
    sink.send(
        Stream.of(
            new MetricFamilySamples(
                "test_metric1", Collector.Type.GAUGE, "help here",
                List.of(new Sample("test_metric1", List.of(), List.of(), 111.111))
            ),
            new MetricFamilySamples(
                "test_metric2", Collector.Type.GAUGE, "help here",
                List.of(new Sample("test_metric2", List.of(), List.of(), 222.222))
            )
        )
    ).block();

    assertThat(queryMetricValue("test_metric1"))
        .isEqualTo("111.111");

    assertThat(queryMetricValue("test_metric2"))
        .isEqualTo("222.222");
  }

  private String queryMetricValue(String metricName) {
    PrometheusClientApi promClient = new PrometheusClientApi(new ApiClient().setBasePath(prometheusContainer.url()));
    QueryResponse resp = promClient.query(metricName, null, null).block();
    return (String) ((List<?>) ((Map<?, ?>) resp.getData().getResult().get(0)).get("value")).get(1);
  }

}
