package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

class PrometheusMetricsRetrieverTest {

  private final PrometheusMetricsRetriever retriever = new PrometheusMetricsRetriever();

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

    MetricsScrapeProperties metricsConfig = prepareMetricsConfig(url.port(), null, null);

    StepVerifier.create(retriever.retrieve(WebClient.create(), url.host(), metricsConfig))
        .expectNextSequence(expectedRawMetrics())
        // third metric should not be present, since it has "NaN" value
        .verifyComplete();
  }

  @Test
  void callsSecureMetricsEndpointAndConvertsResponceToRawMetric() {
    var url = mockWebServer.url("/metrics");
    mockWebServer.enqueue(prepareResponse());


    MetricsScrapeProperties metricsConfig = prepareMetricsConfig(url.port(), "username", "password");

    StepVerifier.create(retriever.retrieve(WebClient.create(), url.host(), metricsConfig))
        .expectNextSequence(expectedRawMetrics())
        // third metric should not be present, since it has "NaN" value
        .verifyComplete();
  }

  MockResponse prepareResponse() {
    // body copied from real jmx exporter
    return new MockResponse().setBody(
        "# HELP kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate Attribute exposed for management \n"
            + "# TYPE kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate untyped\n"
            + "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate{name=\"RequestHandlerAvgIdlePercent\",} 0.898\n"
            + "# HELP kafka_server_socket_server_metrics_request_size_avg The average size of requests sent. \n"
            + "# TYPE kafka_server_socket_server_metrics_request_size_avg untyped\n"
            + "kafka_server_socket_server_metrics_request_size_avg{listener=\"PLAIN\",networkProcessor=\"1\",} 101.1\n"
            + "kafka_server_socket_server_metrics_request_size_avg{listener=\"PLAIN2\",networkProcessor=\"5\",} NaN"
    );
  }

  MetricsScrapeProperties prepareMetricsConfig(Integer port, String username, String password) {
    return MetricsScrapeProperties.builder()
        .ssl(false)
        .port(port)
        //.type(MetricsScrapeProperties.PROMETHEUS_METRICS_TYPE)
        .username(username)
        .password(password)
        .build();
  }

  List<RawMetric> expectedRawMetrics() {

    var firstMetric = RawMetric.create(
        "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate",
        Map.of("name", "RequestHandlerAvgIdlePercent"),
        new BigDecimal("0.898")
    );

    var secondMetric = RawMetric.create(
        "kafka_server_socket_server_metrics_request_size_avg",
        Map.of("listener", "PLAIN", "networkProcessor", "1"),
        new BigDecimal("101.1")
    );
    return List.of(firstMetric, secondMetric);
  }
}
