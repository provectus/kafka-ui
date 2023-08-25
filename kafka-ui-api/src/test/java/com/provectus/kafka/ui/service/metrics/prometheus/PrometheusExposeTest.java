package com.provectus.kafka.ui.service.metrics.prometheus;

import static com.provectus.kafka.ui.service.metrics.prometheus.PrometheusExpose.prepareMetricsForGlobalExpose;
import static io.prometheus.client.Collector.Type.GAUGE;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.service.metrics.scrape.inferred.InferredMetrics;
import io.prometheus.client.Collector.MetricFamilySamples;
import io.prometheus.client.Collector.MetricFamilySamples.Sample;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PrometheusExposeTest {

  @Test
  void prepareMetricsForGlobalExposeAppendsClusterAndBrokerIdLabelsToMetrics() {

    var inferredMfs = new MetricFamilySamples("infer", GAUGE, "help", List.of(
        new Sample("infer1", List.of("lbl1"), List.of("lblVal1"), 100)));

    var broker1Mfs = new MetricFamilySamples("brok", GAUGE, "help", List.of(
        new Sample("brok", List.of("broklbl1"), List.of("broklblVal1"), 101)));

    var broker2Mfs = new MetricFamilySamples("brok", GAUGE, "help", List.of(
        new Sample("brok", List.of("broklbl1"), List.of("broklblVal1"), 102)));

    List<MetricFamilySamples> prepared = prepareMetricsForGlobalExpose(
        "testCluster",
        Metrics.builder()
            .inferredMetrics(new InferredMetrics(List.of(inferredMfs)))
            .perBrokerScrapedMetrics(Map.of(1, List.of(broker1Mfs), 2, List.of(broker2Mfs)))
            .build()
    ).toList();

    assertThat(prepared)
        .hasSize(3)
        .contains(new MetricFamilySamples("infer", GAUGE, "help", List.of(
            new Sample("infer1", List.of("cluster", "lbl1"), List.of("testCluster", "lblVal1"), 100))))
        .contains(
            new MetricFamilySamples("brok", GAUGE, "help", List.of(
                new Sample("brok", List.of("cluster", "broker_id", "broklbl1"),
                    List.of("testCluster", "1", "broklblVal1"), 101)))
        )
        .contains(
            new MetricFamilySamples("brok", GAUGE, "help", List.of(
                new Sample("brok", List.of("cluster", "broker_id", "broklbl1"),
                    List.of("testCluster", "2", "broklblVal1"), 102)))
        );
  }

}
