package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.SchemaSubject;
import com.provectus.kafka.ui.rest.MetricsRestController;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.EntityExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.UUID;

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

    @Test
    public void shouldReturnSuccessWhenCreateNewSchema() {
        String schemaName = UUID.randomUUID().toString();
        String url = "http://localhost:8080/api/clusters/local/schemas/{schemaName}";

        WebTestClient.bindToController(metricsRestController)
                .build()
                .post()
                .uri(url, schemaName)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue("{\"schema\":\"{\\\"type\\\": \\\"string\\\"}\"}"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(SchemaSubject.class).consumeWith(this::assertResponseBodyWhenCreateNewSchema);
    }

    private void assertResponseBodyWhenCreateNewSchema(EntityExchangeResult<SchemaSubject> exchangeResult) {
        SchemaSubject responseBody = exchangeResult.getResponseBody();
        Assertions.assertNotNull(responseBody);
        Assertions.assertEquals(1, responseBody.getId(), "The schema ID should be non-null in the response");
        String message = "It should be null";
        Assertions.assertNull(responseBody.getSchema(), message);
        Assertions.assertNull(responseBody.getSubject(), message);
        Assertions.assertNull(responseBody.getVersion(), message);
    }
}
