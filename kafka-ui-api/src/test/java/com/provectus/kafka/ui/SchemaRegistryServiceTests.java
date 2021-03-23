package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.CompatibilityLevel;
import com.provectus.kafka.ui.model.NewSchemaSubject;
import com.provectus.kafka.ui.model.SchemaSubject;
import com.provectus.kafka.ui.model.SchemaType;
import java.util.List;
import java.util.UUID;
import lombok.extern.log4j.Log4j2;
import lombok.val;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.EntityExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
class SchemaRegistryServiceTests extends AbstractBaseTest {
  @Autowired
  WebTestClient webTestClient;
  String subject;

  @BeforeEach
  public void setUpBefore() {
    this.subject = UUID.randomUUID().toString();
  }

  @Test
  public void should404WhenGetAllSchemasForUnknownCluster() {
    webTestClient
        .get()
        .uri("/api/clusters/unknown-cluster/schemas")
        .exchange()
        .expectStatus().isNotFound();
  }

  @Test
  public void shouldReturn404WhenGetLatestSchemaByNonExistingSubject() {
    String unknownSchema = "unknown-schema";
    webTestClient
        .get()
        .uri("/api/clusters/{clusterName}/schemas/{subject}/latest", LOCAL, unknownSchema)
        .exchange()
        .expectStatus().isNotFound();
  }

  /**
   * It should create a new schema w/o submitting a schemaType field to Schema Registry.
   */
  @Test
  void shouldBeBadRequestIfNoSchemaType() {
    String schema = "{\"subject\":\"%s\",\"schema\":\"{\\\"type\\\": \\\"string\\\"}\"}";

    webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue(String.format(schema, subject)))
        .exchange()
        .expectStatus().isBadRequest();
  }

  @Test
  void shouldReturn409WhenSchemaDuplicatesThePreviousVersion() {
    String schema =
        "{\"subject\":\"%s\",\"schemaType\":\"AVRO\",\"schema\":"
            + "\"{\\\"type\\\": \\\"string\\\"}\"}";

    webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue(String.format(schema, subject)))
        .exchange()
        .expectStatus().isEqualTo(HttpStatus.OK);

    webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue(String.format(schema, subject)))
        .exchange()
        .expectStatus().isEqualTo(HttpStatus.CONFLICT);
  }

  @Test
  void shouldCreateNewProtobufSchema() {
    String schema =
        "syntax = \"proto3\";\n\nmessage MyRecord {\n  int32 id = 1;\n  string name = 2;\n}\n";
    NewSchemaSubject requestBody = new NewSchemaSubject()
        .schemaType(SchemaType.PROTOBUF)
        .subject(subject)
        .schema(schema);
    SchemaSubject actual = webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromPublisher(Mono.just(requestBody), NewSchemaSubject.class))
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(SchemaSubject.class)
        .returnResult()
        .getResponseBody();

    Assertions.assertNotNull(actual);
    Assertions.assertEquals(CompatibilityLevel.CompatibilityEnum.BACKWARD.name(),
        actual.getCompatibilityLevel());
    Assertions.assertEquals("1", actual.getVersion());
    Assertions.assertEquals(SchemaType.PROTOBUF, actual.getSchemaType());
    Assertions.assertEquals(schema, actual.getSchema());
  }

  @Test
  public void shouldReturnBackwardAsGlobalCompatibilityLevelByDefault() {
    webTestClient
        .get()
        .uri("/api/clusters/{clusterName}/schemas/compatibility", LOCAL)
        .exchange()
        .expectStatus().isOk()
        .expectBody(CompatibilityLevel.class)
        .consumeWith(result -> {
          CompatibilityLevel responseBody = result.getResponseBody();
          Assertions.assertNotNull(responseBody);
          Assertions.assertEquals(CompatibilityLevel.CompatibilityEnum.BACKWARD,
              responseBody.getCompatibility());
        });
  }

  @Test
  public void shouldReturnNotEmptyResponseWhenGetAllSchemas() {
    createNewSubjectAndAssert(subject);

    webTestClient
        .get()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
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
        .uri("/api/clusters/{clusterName}/schemas/{subject}/latest", LOCAL, subject)
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SchemaSubject.class)
        .consumeWith(listEntityExchangeResult -> {
          val expectedCompatibility =
              CompatibilityLevel.CompatibilityEnum.BACKWARD;
          assertSchemaWhenGetLatest(subject, listEntityExchangeResult, expectedCompatibility);
        });

    // Now let's change compatibility level of this schema to FULL whereas the global
    // level should be BACKWARD

    webTestClient.put()
        .uri("/api/clusters/{clusterName}/schemas/{subject}/compatibility", LOCAL, subject)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue("{\"compatibility\":\"FULL\"}"))
        .exchange()
        .expectStatus().isOk();

    //Get one more time to check the schema compatibility level is changed to FULL
    webTestClient
        .get()
        .uri("/api/clusters/{clusterName}/schemas/{subject}/latest", LOCAL, subject)
        .exchange()
        .expectStatus().isOk()
        .expectBodyList(SchemaSubject.class)
        .consumeWith(listEntityExchangeResult -> {
          val expectedCompatibility =
              CompatibilityLevel.CompatibilityEnum.FULL;
          assertSchemaWhenGetLatest(subject, listEntityExchangeResult, expectedCompatibility);
        });
  }

  private void createNewSubjectAndAssert(String subject) {
    webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromValue(
            String.format(
                "{\"subject\":\"%s\",\"schemaType\":\"AVRO\",\"schema\":"
                    + "\"{\\\"type\\\": \\\"string\\\"}\"}",
                subject
            )
        ))
        .exchange()
        .expectStatus().isOk()
        .expectBody(SchemaSubject.class)
        .consumeWith(this::assertResponseBodyWhenCreateNewSchema);
  }

  private void assertSchemaWhenGetLatest(
      String subject, EntityExchangeResult<List<SchemaSubject>> listEntityExchangeResult,
      CompatibilityLevel.CompatibilityEnum expectedCompatibility) {
    List<SchemaSubject> responseBody = listEntityExchangeResult.getResponseBody();
    Assertions.assertNotNull(responseBody);
    Assertions.assertEquals(1, responseBody.size());
    SchemaSubject actualSchema = responseBody.get(0);
    Assertions.assertNotNull(actualSchema);
    Assertions.assertEquals(subject, actualSchema.getSubject());
    Assertions.assertEquals("\"string\"", actualSchema.getSchema());

    Assertions.assertNotNull(actualSchema.getCompatibilityLevel());
    Assertions.assertEquals(SchemaType.AVRO, actualSchema.getSchemaType());
    Assertions.assertEquals(expectedCompatibility.name(), actualSchema.getCompatibilityLevel());
  }

  private void assertResponseBodyWhenCreateNewSchema(
      EntityExchangeResult<SchemaSubject> exchangeResult) {
    SchemaSubject responseBody = exchangeResult.getResponseBody();
    Assertions.assertNotNull(responseBody);
    Assertions.assertEquals("1", responseBody.getVersion());
    Assertions.assertNotNull(responseBody.getSchema());
    Assertions.assertNotNull(responseBody.getSubject());
    Assertions.assertNotNull(responseBody.getCompatibilityLevel());
    Assertions.assertEquals(SchemaType.AVRO, responseBody.getSchemaType());
  }
}
