package com.provectus.kafka.ui;

import com.provectus.kafka.ui.rest.MetricsRestController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class SchemaRegistryServiceTests extends AbstractBaseTest {
    @Autowired
    MetricsRestController metricsRestController;

    @Test
    public void shouldReturnEmptyRespWhenGetAllSchemas() {
        WebTestClient.bindToController(metricsRestController)
                .build()
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas")
                .exchange()
                .expectStatus().is2xxSuccessful();
    }
}
