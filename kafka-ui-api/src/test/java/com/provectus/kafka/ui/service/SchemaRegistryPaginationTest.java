package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.controller.SchemasController;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SchemaSubjectDTO;
import com.provectus.kafka.ui.service.audit.AuditService;
import com.provectus.kafka.ui.sr.model.Compatibility;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.util.AccessControlServiceMock;
import com.provectus.kafka.ui.util.ReactiveFailover;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

public class SchemaRegistryPaginationTest {

  private static final String LOCAL_KAFKA_CLUSTER_NAME = "local";

  private SchemasController controller;

  private void init(List<String> subjects) {
    ClustersStorage clustersStorage = mock(ClustersStorage.class);
    when(clustersStorage.getClusterByName(isA(String.class)))
        .thenReturn(Optional.of(buildKafkaCluster(LOCAL_KAFKA_CLUSTER_NAME)));

    SchemaRegistryService schemaRegistryService = mock(SchemaRegistryService.class);
    when(schemaRegistryService.getAllSubjectNames(isA(KafkaCluster.class)))
                .thenReturn(Mono.just(subjects));
    when(schemaRegistryService
            .getAllLatestVersionSchemas(isA(KafkaCluster.class), anyList())).thenCallRealMethod();
    when(schemaRegistryService.getLatestSchemaVersionBySubject(isA(KafkaCluster.class), isA(String.class)))
            .thenAnswer(a -> Mono.just(
                new SchemaRegistryService.SubjectWithCompatibilityLevel(
                    new SchemaSubject().subject(a.getArgument(1)), Compatibility.FULL)));

    this.controller = new SchemasController(schemaRegistryService);
    this.controller.setAccessControlService(new AccessControlServiceMock().getMock());
    this.controller.setAuditService(mock(AuditService.class));
    this.controller.setClustersStorage(clustersStorage);
  }

  @Test
  void shouldListFirst25andThen10Schemas() {
    init(
            IntStream.rangeClosed(1, 100)
                    .boxed()
                    .map(num -> "subject" + num)
                    .toList()
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
                      .toList()
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
                        .toList()
    );
    var schemas = controller.getSchemas(LOCAL_KAFKA_CLUSTER_NAME,
            0, -1, null, null).block();

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
                        .toList()
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
            .schemaRegistryClient(mock(ReactiveFailover.class))
            .build();
  }
}
