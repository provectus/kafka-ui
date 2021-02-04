package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.SchemaSubject;
import com.provectus.kafka.ui.rest.MetricsRestController;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.EntityExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.UUID;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
class SchemaRegistryServiceTests extends AbstractBaseTest {
    @Autowired
    MetricsRestController metricsRestController;

    @Test
    public void should404WhenGetAllSchemasForUnknownCluster() {
        WebTestClient.bindToController(metricsRestController)
                .build()
                .get()
                .uri("http://localhost:8080/api/clusters/unknown-cluster/schemas")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void shouldReturn404WhenGetLatestSchemaByNonExistingSchemaName() {
        String unknownSchema = "unknown-schema";
        WebTestClient.bindToController(metricsRestController).build()
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/{schemaName}/latest", unknownSchema)
                .exchange()
                .expectStatus().isNotFound();
    }

//    @Test
//    void shouldReturnBackwardAsGlobalCompatibilityLevelByDefault() {
//        WebTestClient.bindToController(metricsRestController).build()
//                .get()
//                .uri("http://localhost:8080/api/clusters/local/schemas/compatibility")
//                .exchange()
//                .expectStatus().isOk()
//                .expectBody(CompatibilityLevel.class)
//                .consumeWith(result -> {
//                    CompatibilityLevel responseBody = result.getResponseBody();
//                    Assertions.assertNotNull(responseBody);
//                    Assertions.assertEquals(CompatibilityLevel.BACKWARD.name, responseBody());
//                });
//    }

    @Test
    public void shouldReturnNotNullResponseWhenGetAllSchemas() {
        WebTestClient.bindToController(metricsRestController)
                .build()
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(String.class)
                .consumeWith(result -> {
                    List<String> responseBody = result.getResponseBody();
                    Assertions.assertNotNull(responseBody);
                    log.info("Response of test schemas: {}", responseBody);
                });
    }

    @Test
    public void shouldReturnSuccessAndSchemaIdWhenCreateNewSchema() {
        WebTestClient webTestClient = WebTestClient.bindToController(metricsRestController).build();

        String schemaName = UUID.randomUUID().toString();
        webTestClient
                .post()
                .uri("http://localhost:8080/api/clusters/local/schemas/{schemaName}", schemaName)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue("{\"schema\":\"{\\\"type\\\": \\\"string\\\"}\"}"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(SchemaSubject.class)
                .consumeWith(this::assertResponseBodyWhenCreateNewSchema);

        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/{schemaName}/latest", schemaName)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SchemaSubject.class)
                .consumeWith(listEntityExchangeResult -> assertSchemaWhenGetLatest(schemaName, listEntityExchangeResult));
    }

    private void assertSchemaWhenGetLatest(String schemaName, EntityExchangeResult<List<SchemaSubject>> listEntityExchangeResult) {
        List<SchemaSubject> responseBody = listEntityExchangeResult.getResponseBody();
        Assertions.assertNotNull(responseBody);
        Assertions.assertEquals(1, responseBody.size());
        SchemaSubject actualSchema = responseBody.get(0);
        Assertions.assertNotNull(actualSchema);
        Assertions.assertEquals(schemaName, actualSchema.getSubject());
        Assertions.assertEquals("\"string\"", actualSchema.getSchema());

        Assertions.assertNotNull(actualSchema.getCompatibilityLevel());
        Assertions.assertEquals(CompatibilityLevel.CompatibilityEnum.BACKWARD.name(), actualSchema.getCompatibilityLevel());
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
