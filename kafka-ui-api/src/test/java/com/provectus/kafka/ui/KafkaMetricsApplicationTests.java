package com.provectus.kafka.ui;

import com.provectus.kafka.ui.rest.MetricsRestController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class KafkaMetricsApplicationTests extends AbstractBaseTest {
    @Autowired
    MetricsRestController metricsRestController;

    @Test
    public void shouldReturnEmptyRespWhenGetAllSchemas() {
        WebTestClient testClient = WebTestClient.bindToController(metricsRestController)
                .build();
        testClient.get()
                .uri("http://localhost:8080/api/clusters/local/schemas")
                .exchange()
                .expectStatus().is2xxSuccessful()
                .expectBody().isEmpty();
    }
}
