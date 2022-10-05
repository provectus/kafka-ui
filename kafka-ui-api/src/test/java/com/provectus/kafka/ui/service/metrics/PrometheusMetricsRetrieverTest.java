package com.provectus.kafka.ui.service.metrics;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

class PrometheusMetricsRetrieverTest {

  private final PrometheusMetricsRetriever retriever = new PrometheusMetricsRetriever(WebClient.create());

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
    // body copied from real jmx exporter
    MockResponse response = new MockResponse().setBody(
        "# HELP kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate Attribute exposed for management (kafka.server<type=KafkaRequestHandlerPool, name=RequestHandlerAvgIdlePercent><>FifteenMinuteRate)\n"
            + "# TYPE kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate untyped\n"
            + "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate{name=\"RequestHandlerAvgIdlePercent\",} 0.898\n"
            + "# HELP kafka_server_socket_server_metrics_request_size_avg The average size of requests sent. (kafka.server<type=socket-server-metrics, listener=PLAINTEXT, networkProcessor=1><>request-size-avg)\n"
            + "# TYPE kafka_server_socket_server_metrics_request_size_avg untyped\n"
            + "kafka_server_socket_server_metrics_request_size_avg{listener=\"PLAINTEXT\",networkProcessor=\"1\",} 101.1\n"
            + "kafka_server_socket_server_metrics_request_size_avg{listener=\"PLAINTEXT_HOST\",networkProcessor=\"5\",} NaN"
    );
    mockWebServer.enqueue(response);

    var firstMetric = RawMetric.create(
        "kafka_server_KafkaRequestHandlerPool_FifteenMinuteRate",
        Map.of("name", "RequestHandlerAvgIdlePercent"),
        new BigDecimal("0.898")
    );

    var second = RawMetric.create(
        "kafka_server_socket_server_metrics_request_size_avg",
        Map.of("listener", "PLAINTEXT", "networkProcessor", "1"),
        new BigDecimal("101.1")
    );

    StepVerifier.create(retriever.retrieve(url.host(), url.port(), false))
        .expectNext(firstMetric)
        .expectNext(second)
        // third metric should not be present, since it has "NaN" value
        .verifyComplete();
  }

}