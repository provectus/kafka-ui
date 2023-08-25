package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static io.prometheus.client.Collector.Type;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import io.prometheus.client.Collector.MetricFamilySamples.Sample;
import java.io.IOException;
import java.util.List;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class PrometheusMetricsRetrieverTest {

  private final MockWebServer mockWebServer = new MockWebServer();

  @BeforeEach
  void startMockServer() throws IOException {
    mockWebServer.start();
  }

  @AfterEach
  void stopMockServer() throws IOException {
    mockWebServer.close();
  }

  @Test
  void callsMetricsEndpointAndConvertsResponceToRawMetric() {
    var url = mockWebServer.url("/metrics");
    mockWebServer.enqueue(prepareResponse());

    MetricsScrapeProperties scrapeProperties = prepareMetricsConfig(url.port(), null, null);
    var retriever = new PrometheusMetricsRetriever(scrapeProperties);

    StepVerifier.create(retriever.retrieve(url.host()))
        .assertNext(metrics -> assertThat(metrics).containsExactlyElementsOf(expectedMetrics()))
        .verifyComplete();
  }

  @Test
  void callsSecureMetricsEndpointAndConvertsResponceToRawMetric() {
    var url = mockWebServer.url("/metrics");
    mockWebServer.enqueue(prepareResponse());

    MetricsScrapeProperties scrapeProperties = prepareMetricsConfig(url.port(), "username", "password");
    var retriever = new PrometheusMetricsRetriever(scrapeProperties);

    StepVerifier.create(retriever.retrieve(url.host()))
        .assertNext(metrics -> assertThat(metrics).containsExactlyElementsOf(expectedMetrics()))
        .verifyComplete();
  }

  private MockResponse prepareResponse() {
    // body copied from jmx exporter output
    return new MockResponse().setBody(
        """
            # HELP kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate Attribute exposed for management
            # TYPE kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate untyped
            kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate{name="RequestHandlerAvgIdlePercent",} 0.898
            # HELP kafka_server_socket_server_metrics_request_size_avg The average size of requests sent.
            # TYPE kafka_server_socket_server_metrics_request_size_avg untyped
            kafka_server_socket_server_metrics_request_size_avg{listener="PLAIN",networkProcessor="1",} 101.1
            kafka_server_socket_server_metrics_request_size_avg{listener="PLAIN2",networkProcessor="5",} 202.2
            """
    );
  }

  private MetricsScrapeProperties prepareMetricsConfig(Integer port, String username, String password) {
    return MetricsScrapeProperties.builder()
        .ssl(false)
        .port(port)
        .username(username)
        .password(password)
        .build();
  }

  private List<MetricFamilySamples> expectedMetrics() {
    return List.of(
        new MetricFamilySamples(
            "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate",
            Type.GAUGE,
            "Attribute exposed for management",
            List.of(
                new Sample(
                    "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate",
                    List.of("name"),
                    List.of("RequestHandlerAvgIdlePercent"),
                    0.898
                )
            )
        ),
        new MetricFamilySamples(
            "kafka_server_socket_server_metrics_request_size_avg",
            Type.GAUGE,
            "The average size of requests sent.",
            List.of(
                new Sample(
                    "kafka_server_socket_server_metrics_request_size_avg",
                    List.of("listener", "networkProcessor"),
                    List.of("PLAIN", "1"),
                    101.1
                ),
                new Sample(
                    "kafka_server_socket_server_metrics_request_size_avg",
                    List.of("listener", "networkProcessor"),
                    List.of("PLAIN2", "5"),
                    202.2
                )
            )
        )
    );
  }
}
