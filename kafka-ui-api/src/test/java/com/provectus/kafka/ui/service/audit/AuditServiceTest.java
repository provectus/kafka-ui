package com.provectus.kafka.ui.service.audit;

import static com.provectus.kafka.ui.service.audit.AuditService.createAuditWriter;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Signal;

class AuditServiceTest {

  @Test
  void isAuditTopicChecksIfAuditIsEnabledForCluster() {
    Map<String, AuditWriter> writers = Map.of(
        "c1", new AuditWriter("с1", true, "c1topic", null, null),
        "c2", new AuditWriter("c2", false, "c2topic", mock(KafkaProducer.class), null)
    );

    var auditService = new AuditService(writers);
    assertThat(auditService.isAuditTopic(KafkaCluster.builder().name("notExist").build(), "some"))
        .isFalse();
    assertThat(auditService.isAuditTopic(KafkaCluster.builder().name("c1").build(), "c1topic"))
        .isFalse();
    assertThat(auditService.isAuditTopic(KafkaCluster.builder().name("c2").build(), "c2topic"))
        .isTrue();
  }

  @Test
  void auditCallsWriterMethodDependingOnSignal() {
    var auditWriter = mock(AuditWriter.class);
    var auditService = new AuditService(Map.of("test", auditWriter));

    var cxt = AccessContext.builder().cluster("test").build();

    auditService.audit(cxt, Signal.complete());
    verify(auditWriter).write(any(), any(), eq(null));

    var th = new Exception("testError");
    auditService.audit(cxt, Signal.error(th));
    verify(auditWriter).write(any(), any(), eq(th));
  }

  @Nested
  class CreateAuditWriter {

    private final ReactiveAdminClient adminClientMock = mock(ReactiveAdminClient.class);
    private final Supplier<KafkaProducer<byte[], byte[]>> producerSupplierMock = mock(Supplier.class);

    private final ClustersProperties.Cluster clustersProperties = new ClustersProperties.Cluster();

    private final KafkaCluster cluster = KafkaCluster
        .builder()
        .name("test")
        .originalProperties(clustersProperties)
        .build();


    @BeforeEach
    void init() {
      when(producerSupplierMock.get())
          .thenReturn(mock(KafkaProducer.class));
    }

    @Test
    void logOnlyAlterOpsByDefault() {
      var auditProps = new ClustersProperties.AuditProperties();
      auditProps.setConsoleAuditEnabled(true);
      clustersProperties.setAudit(auditProps);

      var maybeWriter = createAuditWriter(cluster, () -> adminClientMock, producerSupplierMock);
      assertThat(maybeWriter)
          .hasValueSatisfying(w -> assertThat(w.logAlterOperationsOnly()).isTrue());
    }

    @Test
    void noWriterIfNoAuditPropsSet() {
      var maybeWriter = createAuditWriter(cluster, () -> adminClientMock, producerSupplierMock);
      assertThat(maybeWriter).isEmpty();
    }

    @Test
    void setsLoggerIfConsoleLoggingEnabled() {
      var auditProps = new ClustersProperties.AuditProperties();
      auditProps.setConsoleAuditEnabled(true);
      clustersProperties.setAudit(auditProps);

      var maybeWriter = createAuditWriter(cluster, () -> adminClientMock, producerSupplierMock);
      assertThat(maybeWriter).isPresent();

      var writer = maybeWriter.get();
      assertThat(writer.consoleLogger()).isNotNull();
    }

    @Nested
    class WhenTopicAuditEnabled {

      @BeforeEach
      void setTopicWriteProperties() {
        var auditProps = new ClustersProperties.AuditProperties();
        auditProps.setTopicAuditEnabled(true);
        auditProps.setTopic("test_audit_topic");
        auditProps.setAuditTopicsPartitions(3);
        auditProps.setAuditTopicProperties(Map.of("p1", "v1"));
        clustersProperties.setAudit(auditProps);
      }

      @Test
      void createsProducerIfTopicExists() {
        when(adminClientMock.listTopics(true))
            .thenReturn(Mono.just(Set.of("test_audit_topic")));

        var maybeWriter = createAuditWriter(cluster, () -> adminClientMock, producerSupplierMock);
        assertThat(maybeWriter).isPresent();

        //checking there was no topic creation request
        verify(adminClientMock, times(0))
            .createTopic(any(), anyInt(), anyInt(), anyMap());

        var writer = maybeWriter.get();
        assertThat(writer.producer()).isNotNull();
        assertThat(writer.targetTopic()).isEqualTo("test_audit_topic");
      }

      @Test
      void createsProducerAndTopicIfItIsNotExist() {
        when(adminClientMock.listTopics(true))
            .thenReturn(Mono.just(Set.of()));

        when(adminClientMock.createTopic(eq("test_audit_topic"), eq(3), eq(null), anyMap()))
            .thenReturn(Mono.empty());

        var maybeWriter = createAuditWriter(cluster, () -> adminClientMock, producerSupplierMock);
        assertThat(maybeWriter).isPresent();

        //verifying topic created
        verify(adminClientMock).createTopic(eq("test_audit_topic"), eq(3), eq(null), anyMap());

        var writer = maybeWriter.get();
        assertThat(writer.producer()).isNotNull();
        assertThat(writer.targetTopic()).isEqualTo("test_audit_topic");
      }

    }
  }


}
