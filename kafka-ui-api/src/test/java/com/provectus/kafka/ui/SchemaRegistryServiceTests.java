package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.SchemaSubject;
import lombok.extern.log4j.Log4j2;
import lombok.val;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.EntityExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.UUID;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
class SchemaRegistryServiceTests extends AbstractBaseTest {
    @Autowired
    WebTestClient webTestClient;
    String subject;

    @BeforeEach
    void setUpBefore() {
        this.subject = UUID.randomUUID().toString();
    }

    @Test
    public void should404WhenGetAllSchemasForUnknownCluster() {
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/unknown-cluster/schemas")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    public void shouldReturn404WhenGetLatestSchemaByNonExistingSubject() {
        String unknownSchema = "unknown-schema";
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/{subject}/latest", unknownSchema)
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    public void shouldReturnBackwardAsGlobalCompatibilityLevelByDefault() {
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/compatibility")
                .exchange()
                .expectStatus().isOk()
                .expectBody(CompatibilityLevel.class)
                .consumeWith(result -> {
                    CompatibilityLevel responseBody = result.getResponseBody();
                    Assertions.assertNotNull(responseBody);
                    Assertions.assertEquals(CompatibilityLevel.CompatibilityEnum.BACKWARD, responseBody.getCompatibility());
                });
    }

    @Test
    public void shouldReturnNotEmptyResponseWhenGetAllSchemas() {
        createNewSubjectAndAssert(subject);

        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SchemaSubject.class)
                .consumeWith(result -> {
                    List<SchemaSubject> responseBody = result.getResponseBody();
                    log.info("Response of test schemas: {}", responseBody);
                    Assertions.assertNotNull(responseBody);
                    Assertions.assertFalse(responseBody.isEmpty());

                    SchemaSubject actualSchemaSubject = responseBody.stream()
                            .filter(schemaSubject -> subject.equals(schemaSubject.getSubject()))
                            .findFirst()
                            .orElseThrow();
                    Assertions.assertNotNull(actualSchemaSubject.getId());
                    Assertions.assertNotNull(actualSchemaSubject.getVersion());
                    Assertions.assertNotNull(actualSchemaSubject.getCompatibilityLevel());
                    Assertions.assertEquals("\"string\"", actualSchemaSubject.getSchema());
                });
    }

    @Test
    public void shouldOkWhenCreateNewSchemaThenGetAndUpdateItsCompatibilityLevel() {
        createNewSubjectAndAssert(subject);

        //Get the created schema and check its items
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/{subject}/latest", subject)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SchemaSubject.class)
                .consumeWith(listEntityExchangeResult -> {
                    val expectedCompatibility = CompatibilityLevel.CompatibilityEnum.BACKWARD;
                    assertSchemaWhenGetLatest(subject, listEntityExchangeResult, expectedCompatibility);
                });

        //Now let's change compatibility level of this schema to FULL whereas the global level should be BACKWARD
        webTestClient.put()
                .uri("http://localhost:8080/api/clusters/local/schemas/{subject}/compatibility", subject)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue("{\"compatibility\":\"FULL\"}"))
                .exchange()
                .expectStatus().isOk();

        //Get one more time to check the schema compatibility level is changed to FULL
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/schemas/{subject}/latest", subject)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(SchemaSubject.class)
                .consumeWith(listEntityExchangeResult -> {
                    val expectedCompatibility = CompatibilityLevel.CompatibilityEnum.FULL;
                    assertSchemaWhenGetLatest(subject, listEntityExchangeResult, expectedCompatibility);
                });
    }

    private void createNewSubjectAndAssert(String subject) {
        webTestClient
                .post()
                .uri("http://localhost:8080/api/clusters/local/schemas/{subject}", subject)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue("{\"schema\":\"{\\\"type\\\": \\\"string\\\"}\"}"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(SchemaSubject.class)
                .consumeWith(this::assertResponseBodyWhenCreateNewSchema);
    }

    private void assertSchemaWhenGetLatest(String subject, EntityExchangeResult<List<SchemaSubject>> listEntityExchangeResult, CompatibilityLevel.CompatibilityEnum expectedCompatibility) {
        List<SchemaSubject> responseBody = listEntityExchangeResult.getResponseBody();
        Assertions.assertNotNull(responseBody);
        Assertions.assertEquals(1, responseBody.size());
        SchemaSubject actualSchema = responseBody.get(0);
        Assertions.assertNotNull(actualSchema);
        Assertions.assertEquals(subject, actualSchema.getSubject());
        Assertions.assertEquals("\"string\"", actualSchema.getSchema());

        Assertions.assertNotNull(actualSchema.getCompatibilityLevel());
        Assertions.assertEquals(expectedCompatibility.name(), actualSchema.getCompatibilityLevel());
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
