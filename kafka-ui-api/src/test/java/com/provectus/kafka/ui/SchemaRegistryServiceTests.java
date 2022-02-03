package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.CompatibilityLevelDTO;
import com.provectus.kafka.ui.model.NewSchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.model.SchemaSubjectsResponseDTO;
import com.provectus.kafka.ui.model.SchemaTypeDTO;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
    NewSchemaSubjectDTO requestBody = new NewSchemaSubjectDTO()
        .schemaType(SchemaTypeDTO.PROTOBUF)
        .subject(subject)
        .schema(schema);
    SchemaSubjectDTO actual = webTestClient
        .post()
        .uri("/api/clusters/{clusterName}/schemas", LOCAL)
        .contentType(MediaType.APPLICATION_JSON)
        .body(BodyInserters.fromPublisher(Mono.just(requestBody), NewSchemaSubjectDTO.class))
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(SchemaSubjectDTO.class)
        .returnResult()
        .getResponseBody();

    Assertions.assertNotNull(actual);
    Assertions.assertEquals(CompatibilityLevelDTO.CompatibilityEnum.BACKWARD.name(),
        actual.getCompatibilityLevel());
    Assertions.assertEquals("1", actual.getVersion());
    Assertions.assertEquals(SchemaTypeDTO.PROTOBUF, actual.getSchemaType());
    Assertions.assertEquals(schema, actual.getSchema());
  }

  @Test
  public void shouldReturnBackwardAsGlobalCompatibilityLevelByDefault() {
    webTestClient
        .get()
        .uri("/api/clusters/{clusterName}/schemas/compatibility", LOCAL)
        .exchange()
        .expectStatus().isOk()
        .expectBody(CompatibilityLevelDTO.class)
        .consumeWith(result -> {
          CompatibilityLevelDTO responseBody = result.getResponseBody();
          Assertions.assertNotNull(responseBody);
          Assertions.assertEquals(CompatibilityLevelDTO.CompatibilityEnum.BACKWARD,
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
        .expectBody(SchemaSubjectsResponseDTO.class)
        .consumeWith(result -> {
          SchemaSubjectsResponseDTO responseBody = result.getResponseBody();
          log.info("Response of test schemas: {}", responseBody);
          Assertions.assertNotNull(responseBody);
          Assertions.assertFalse(responseBody.getSchemas().isEmpty());

          SchemaSubjectDTO actualSchemaSubject = responseBody.getSchemas().stream()
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
        .expectBodyList(SchemaSubjectDTO.class)
        .consumeWith(listEntityExchangeResult -> {
          val expectedCompatibility =
              CompatibilityLevelDTO.CompatibilityEnum.BACKWARD;
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
        .expectBodyList(SchemaSubjectDTO.class)
        .consumeWith(listEntityExchangeResult -> {
          val expectedCompatibility =
              CompatibilityLevelDTO.CompatibilityEnum.FULL;
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
        .expectBody(SchemaSubjectDTO.class)
        .consumeWith(this::assertResponseBodyWhenCreateNewSchema);
  }

  private void assertSchemaWhenGetLatest(
      String subject, EntityExchangeResult<List<SchemaSubjectDTO>> listEntityExchangeResult,
      CompatibilityLevelDTO.CompatibilityEnum expectedCompatibility) {
    List<SchemaSubjectDTO> responseBody = listEntityExchangeResult.getResponseBody();
    Assertions.assertNotNull(responseBody);
    Assertions.assertEquals(1, responseBody.size());
    SchemaSubjectDTO actualSchema = responseBody.get(0);
    Assertions.assertNotNull(actualSchema);
    Assertions.assertEquals(subject, actualSchema.getSubject());
    Assertions.assertEquals("\"string\"", actualSchema.getSchema());

    Assertions.assertNotNull(actualSchema.getCompatibilityLevel());
    Assertions.assertEquals(SchemaTypeDTO.AVRO, actualSchema.getSchemaType());
    Assertions.assertEquals(expectedCompatibility.name(), actualSchema.getCompatibilityLevel());
  }

  private void assertResponseBodyWhenCreateNewSchema(
      EntityExchangeResult<SchemaSubjectDTO> exchangeResult) {
    SchemaSubjectDTO responseBody = exchangeResult.getResponseBody();
    Assertions.assertNotNull(responseBody);
    Assertions.assertEquals("1", responseBody.getVersion());
    Assertions.assertNotNull(responseBody.getSchema());
    Assertions.assertNotNull(responseBody.getSubject());
    Assertions.assertNotNull(responseBody.getCompatibilityLevel());
    Assertions.assertEquals(SchemaTypeDTO.AVRO, responseBody.getSchemaType());
  }
}
