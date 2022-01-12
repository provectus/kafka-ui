package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.controller.SchemasController;
import com.provectus.kafka.ui.model.InternalSchemaRegistry;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import java.util.Comparator;
import java.util.Optional;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

public class SchemaRegistryPaginationTest {

  private static final String LOCAL_KAFKA_CLUSTER_NAME = "local";

  private final SchemaRegistryService schemaRegistryService = mock(SchemaRegistryService.class);
  private final ClustersStorage clustersStorage = mock(ClustersStorage.class);

  private SchemasController controller;

  private void init(String[] subjects) {
    when(schemaRegistryService.getAllSubjectNames(isA(KafkaCluster.class)))
                .thenReturn(Mono.just(subjects));
    when(schemaRegistryService
            .getAllLatestVersionSchemas(isA(KafkaCluster.class), anyList())).thenCallRealMethod();
    when(clustersStorage.getClusterByName(isA(String.class)))
            .thenReturn(Optional.of(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME)));
    when(schemaRegistryService.getLatestSchemaVersionBySubject(isA(KafkaCluster.class), isA(String.class)))
            .thenAnswer(a -> Mono.just(new SchemaSubjectDTO().subject(a.getArgument(1))));
    this.controller = new SchemasController(schemaRegistryService);
    this.controller.setClustersStorage(clustersStorage);
  }

  @Test
  void shouldListFirst25andThen10Schemas() {
    init(
            IntStream.rangeClosed(1, 100)
                    .boxed()
                    .map(num -> "subject" + num)
                    .toArray(String[]::new)
    );
    var schemasFirst25 = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            null, null, null, null).block();
    assertThat(schemasFirst25.getBody().getPageCount()).isEqualTo(4);
    assertThat(schemasFirst25.getBody().getSchemas()).hasSize(25);
    assertThat(schemasFirst25.getBody().getSchemas())
            .isSortedAccordingTo(Comparator.comparing(SchemaSubjectDTO::getSubject));

    var schemasFirst10 = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            null, 10, null, null).block();

    assertThat(schemasFirst10.getBody().getPageCount()).isEqualTo(10);
    assertThat(schemasFirst10.getBody().getSchemas()).hasSize(10);
    assertThat(schemasFirst10.getBody().getSchemas())
            .isSortedAccordingTo(Comparator.comparing(SchemaSubjectDTO::getSubject));
  }

  @Test
  void shouldListSchemasContaining_1() {
    init(
              IntStream.rangeClosed(1, 100)
                      .boxed()
                      .map(num -> "subject" + num)
                      .toArray(String[]::new)
    );
    var schemasSearch7 = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            null, null, "1", null).block();
    assertThat(schemasSearch7.getBody().getPageCount()).isEqualTo(1);
    assertThat(schemasSearch7.getBody().getSchemas()).hasSize(20);
  }

  @Test
  void shouldCorrectlyHandleNonPositivePageNumberAndPageSize() {
    init(
                IntStream.rangeClosed(1, 100)
                        .boxed()
                        .map(num -> "subject" + num)
                        .toArray(String[]::new)
    );
    var schemas = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            0, -1, null, null).block();;

    assertThat(schemas.getBody().getPageCount()).isEqualTo(4);
    assertThat(schemas.getBody().getSchemas()).hasSize(25);
    assertThat(schemas.getBody().getSchemas()).isSortedAccordingTo(Comparator.comparing(SchemaSubjectDTO::getSubject));
  }

  @Test
  void shouldCalculateCorrectPageCountForNonDivisiblePageSize() {
    init(
                IntStream.rangeClosed(1, 100)
                        .boxed()
                        .map(num -> "subject" + num)
                        .toArray(String[]::new)
    );

    var schemas = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            4, 33, null, null).block();

    assertThat(schemas.getBody().getPageCount()).isEqualTo(4);
    assertThat(schemas.getBody().getSchemas()).hasSize(1);
    assertThat(schemas.getBody().getSchemas().get(0).getSubject()).isEqualTo("subject99");
  }

  private KafkaCluster buildKafkaCluster(String clusterName) {
    return KafkaCluster.builder()
            .name(clusterName)
            .schemaRegistry(InternalSchemaRegistry.builder().build())
            .build();
  }
}
