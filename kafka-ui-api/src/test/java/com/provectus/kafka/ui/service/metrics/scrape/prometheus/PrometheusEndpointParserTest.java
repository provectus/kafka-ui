package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import static com.provectus.kafka.ui.service.metrics.scrape.prometheus.PrometheusEndpointParser.parse;
import static io.prometheus.client.Collector.MetricFamilySamples;
import static io.prometheus.client.Collector.MetricFamilySamples.Sample;
import static io.prometheus.client.Collector.Type;
import static java.lang.Double.POSITIVE_INFINITY;
import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.Iterators;
import com.google.common.collect.Lists;
import com.provectus.kafka.ui.service.metrics.PrometheusEndpointExpose;
import io.prometheus.client.Collector;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.Counter;
import io.prometheus.client.Gauge;
import io.prometheus.client.Histogram;
import io.prometheus.client.Info;
import io.prometheus.client.Summary;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;

class PrometheusEndpointParserTest {

  @Test
  void parsesAllGeneratedMetricTypes() {
    List<MetricFamilySamples> original = generateMfs();
    String exposed = PrometheusEndpointExpose.constructResponse(original.stream()).getBody();
    List<MetricFamilySamples> parsed = parse(exposed.lines());
    assertThat(parsed).containsExactlyElementsOf(original);
  }

  @Test
  void parsesMetricsFromPrometheusEndpointOutput() {
    String expose = """
            # HELP http_requests_total The total number of HTTP requests.
            # TYPE http_requests_total counter
            http_requests_total{method="post",code="200",} 1027 1395066363000
            http_requests_total{method="post",code="400",}    3 1395066363000
            # Minimalistic line:
            metric_without_timestamp_and_labels 12.47

            # A weird metric from before the epoch:
            something_weird{problem="division by zero"} +Inf -3982045

            # TYPE something_untyped untyped
            something_untyped{} -123123

            # TYPE unit_test_seconds counter
            # UNIT unit_test_seconds seconds
            # HELP unit_test_seconds Testing that unit parsed properly
            unit_test_seconds_total 4.20072246e+06

            # HELP http_request_duration_seconds A histogram of the request duration.
            # TYPE http_request_duration_seconds histogram
            http_request_duration_seconds_bucket{le="0.05"} 24054
            http_request_duration_seconds_bucket{le="0.1"} 33444
            http_request_duration_seconds_bucket{le="0.2"} 100392
            http_request_duration_seconds_bucket{le="0.5"} 129389
            http_request_duration_seconds_bucket{le="1"} 133988
            http_request_duration_seconds_bucket{le="+Inf"} 144320
            http_request_duration_seconds_sum 53423
            http_request_duration_seconds_count 144320
        """;
    List<MetricFamilySamples> parsed = parse(expose.lines());
    assertThat(parsed).contains(
        new MetricFamilySamples(
            "http_requests_total",
            Type.COUNTER,
            "The total number of HTTP requests.",
            List.of(
                new Sample("http_requests_total", List.of("method", "code"), List.of("post", "200"), 1027),
                new Sample("http_requests_total", List.of("method", "code"), List.of("post", "400"), 3)
            )
        ),
        new MetricFamilySamples(
            "metric_without_timestamp_and_labels",
            Type.GAUGE,
            "metric_without_timestamp_and_labels",
            List.of(new Sample("metric_without_timestamp_and_labels", List.of(), List.of(), 12.47))
        ),
        new MetricFamilySamples(
            "something_weird",
            Type.GAUGE,
            "something_weird",
            List.of(new Sample("something_weird", List.of("problem"), List.of("division by zero"), POSITIVE_INFINITY))
        ),
        new MetricFamilySamples(
            "something_untyped",
            Type.GAUGE,
            "something_untyped",
            List.of(new Sample("something_untyped", List.of(), List.of(), -123123))
        ),
        new MetricFamilySamples(
            "unit_test_seconds",
            "seconds",
            Type.COUNTER,
            "Testing that unit parsed properly",
            List.of(new Sample("unit_test_seconds_total", List.of(), List.of(), 4.20072246e+06))
        ),
        new MetricFamilySamples(
            "http_request_duration_seconds",
            Type.HISTOGRAM,
            "A histogram of the request duration.",
            List.of(
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("0.05"), 24054),
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("0.1"), 33444),
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("0.2"), 100392),
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("0.5"), 129389),
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("1"), 133988),
                new Sample("http_request_duration_seconds_bucket", List.of("le"), List.of("+Inf"), 144320),
                new Sample("http_request_duration_seconds_sum", List.of(), List.of(), 53423),
                new Sample("http_request_duration_seconds_count", List.of(), List.of(), 144320)
            )
        )
    );
  }

  private List<MetricFamilySamples> generateMfs() {
    CollectorRegistry collectorRegistry = new CollectorRegistry();

    Gauge.build()
        .name("test_gauge")
        .help("help for gauge")
        .register(collectorRegistry)
        .set(42);

    Info.build()
        .name("test_info")
        .help("help for info")
        .register(collectorRegistry)
        .info("branch", "HEAD", "version", "1.2.3", "revision", "e0704b");

    Counter.build()
        .name("counter_no_labels")
        .help("help for counter no lbls")
        .register(collectorRegistry)
        .inc(111);

    var counterWithLbls = Counter.build()
        .name("counter_with_labels")
        .help("help for counter with lbls")
        .labelNames("lbl1", "lbl2")
        .register(collectorRegistry);

    counterWithLbls.labels("v1", "v2").inc(234);
    counterWithLbls.labels("v11", "v22").inc(345);

    var histogram = Histogram.build()
        .name("test_hist")
        .help("help for hist")
        .linearBuckets(0.0, 1.0, 10)
        .labelNames("lbl1", "lbl2")
        .register(collectorRegistry);

    var summary = Summary.build()
        .name("test_summary")
        .help("help for hist")
        .labelNames("lbl1", "lbl2")
        .register(collectorRegistry);

    for (int i = 0; i < 30; i++) {
      var val = ThreadLocalRandom.current().nextDouble(10.0);
      histogram.labels("v1", "v2").observe(val);
      summary.labels("v1", "v2").observe(val);
    }

    //emulating unknown type
    collectorRegistry.register(new Collector() {
      @Override
      public List<MetricFamilySamples> collect() {
        return List.of(
            new MetricFamilySamples(
                "test_unknown",
                Type.UNKNOWN,
                "help for unknown",
                List.of(new Sample("test_unknown", List.of("l1"), List.of("v1"), 23432.0))
            )
        );
      }
    });
    return Lists.newArrayList(Iterators.forEnumeration(collectorRegistry.metricFamilySamples()));
  }

}
