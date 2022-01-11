package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Optional;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

public class SchemaRegistryPaginationTest {

  private static final String LOCAL_KAFKA_CLUSTER_NAME = "local";

  private final SchemaRegistryService schemaRegistryService = mock(SchemaRegistryService.class);
  private SchemaRegistryService.Pagination pagination;

  private void init(String[] subjects) {
    when(schemaRegistryService.getAllSubjectNames(isA(KafkaCluster.class)))
                .thenReturn(Mono.just(subjects));
    pagination = new SchemaRegistryService.Pagination(schemaRegistryService);
  }

  @Test
  void shouldListFirst25andThen10Schemas() {
    init(
            IntStream.rangeClosed(1, 100)
                    .boxed()
                    .map(num -> "subject" + num)
                    .toArray(String[]::new)
    );
    var schemasFirst25 = pagination.getPage(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME),
            Optional.empty(),
            Optional.empty(),
            Optional.empty()).block();
    assertThat(schemasFirst25.getTotalPages()).isEqualTo(4);
    assertThat(schemasFirst25.getSubjects()).hasSize(25);
    assertThat(schemasFirst25.getSubjects()).isSorted();

    var schemasFirst10 = pagination.getPage(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME),
            Optional.empty(),
            Optional.of(10),
            Optional.empty()).block();

    assertThat(schemasFirst10.getTotalPages()).isEqualTo(10);
    assertThat(schemasFirst10.getSubjects()).hasSize(10);
    assertThat(schemasFirst10.getSubjects()).isSorted();
  }

  @Test
  void shouldListSchemasContaining_1() {
    init(
              IntStream.rangeClosed(1, 100)
                      .boxed()
                      .map(num -> "subject" + num)
                      .toArray(String[]::new)
    );
    var schemasSearch7 = pagination.getPage(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME),
              Optional.empty(),
              Optional.empty(),
              Optional.of("1")).block();
    assertThat(schemasSearch7.getTotalPages()).isEqualTo(1);
    assertThat(schemasSearch7.getSubjects()).hasSize(20);
  }

  @Test
  void shouldCorrectlyHandleNonPositivePageNumberAndPageSize() {
    init(
                IntStream.rangeClosed(1, 100)
                        .boxed()
                        .map(num -> "subject" + num)
                        .toArray(String[]::new)
    );
    var schemas = pagination.getPage(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME),
                Optional.of(0),
                Optional.of(-1),
                Optional.empty()).block();

    assertThat(schemas.getTotalPages()).isEqualTo(4);
    assertThat(schemas.getSubjects()).hasSize(25);
    assertThat(schemas.getSubjects()).isSorted();
  }

  @Test
  void shouldCalculateCorrectPageCountForNonDivisiblePageSize() {
    init(
                IntStream.rangeClosed(1, 100)
                        .boxed()
                        .map(num -> "subject" + num)
                        .toArray(String[]::new)
    );

    var schemas = pagination.getPage(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME),
                Optional.of(4),
                Optional.of(33),
                Optional.empty()).block();

    assertThat(schemas.getTotalPages()).isEqualTo(4);
    assertThat(schemas.getSubjects()).hasSize(1);
    assertThat(schemas.getSubjects().get(0)).isEqualTo("subject99");
  }

  private KafkaCluster buildKafkaCluster(String clusterName) {
    return KafkaCluster.builder().name(clusterName).build();
  }
}
