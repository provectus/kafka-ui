package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.toMonoWithExceptionFilter;
import static java.util.Objects.requireNonNull;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.internals.KafkaFutureImpl;
import org.junit.function.ThrowingRunnable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class ReactiveAdminClientTest extends AbstractIntegrationTest {

  private final List<ThrowingRunnable> clearings = new ArrayList<>();

  private AdminClient adminClient;
  private ReactiveAdminClient reactiveAdminClient;

  @BeforeEach
  void init() {
    AdminClientService adminClientService = applicationContext.getBean(AdminClientService.class);
    ClustersStorage clustersStorage = applicationContext.getBean(ClustersStorage.class);
    reactiveAdminClient = requireNonNull(adminClientService.get(clustersStorage.getClusterByName(LOCAL).get()).block());
    adminClient = reactiveAdminClient.getClient();
  }

  @AfterEach
  void tearDown() {
    for (ThrowingRunnable clearing : clearings) {
      try {
        clearing.run();
      } catch (Throwable th) {
        //NOOP
      }
    }
  }

  @Test
  void testUpdateTopicConfigs() throws Exception {
    String topic = UUID.randomUUID().toString();
    createTopics(new NewTopic(topic, 1, (short) 1));

    var configResource = new ConfigResource(ConfigResource.Type.TOPIC, topic);

    adminClient.incrementalAlterConfigs(
        Map.of(
            configResource,
            List.of(
                new AlterConfigOp(new ConfigEntry("compression.type", "gzip"), AlterConfigOp.OpType.SET),
                new AlterConfigOp(new ConfigEntry("retention.bytes", "12345678"), AlterConfigOp.OpType.SET)
            )
        )
    ).all().get();

    StepVerifier.create(
        reactiveAdminClient.updateTopicConfig(
            topic,
            Map.of(
                "compression.type", "snappy", //changing existing config
                "file.delete.delay.ms", "12345" // adding new one
            )
        )
    ).expectComplete().verify();

    Config config = adminClient.describeConfigs(List.of(configResource)).values().get(configResource).get();
    assertThat(config.get("retention.bytes").value()).isNotEqualTo("12345678"); // wes reset to default
    assertThat(config.get("compression.type").value()).isEqualTo("snappy");
    assertThat(config.get("file.delete.delay.ms").value()).isEqualTo("12345");
  }


  @SneakyThrows
  void createTopics(NewTopic... topics) {
    adminClient.createTopics(List.of(topics)).all().get();
    clearings.add(() -> adminClient.deleteTopics(Stream.of(topics).map(NewTopic::name).toList()).all().get());
  }

  @Test
  void testToMonoWithExceptionFilter() {
    var failedFuture = new KafkaFutureImpl<String>();
    failedFuture.completeExceptionally(new UnknownTopicOrPartitionException());

    var okFuture = new KafkaFutureImpl<String>();
    okFuture.complete("done");

    Map<String, KafkaFuture<String>> arg = Map.of("failure", failedFuture, "ok", okFuture);
    StepVerifier.create(toMonoWithExceptionFilter(arg, UnknownTopicOrPartitionException.class))
        .assertNext(result -> assertThat(result).hasSize(1).containsEntry("ok", "done"))
        .verifyComplete();
  }

  @Test
  void testListOffsetsUnsafe() {
    String topic = UUID.randomUUID().toString();
    createTopics(new NewTopic(topic, 2, (short) 1));

    // sending messages to have non-zero offsets for tp
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      producer.send(new ProducerRecord<>(topic, 1, "k", "v"));
      producer.send(new ProducerRecord<>(topic, 1, "k", "v"));
    }

    var requestedPartitions = List.of(
        new TopicPartition(topic, 0),
        new TopicPartition(topic, 1)
    );

    StepVerifier.create(reactiveAdminClient.listOffsetsUnsafe(requestedPartitions, OffsetSpec.earliest()))
        .assertNext(offsets -> {
          assertThat(offsets)
              .hasSize(2)
              .containsEntry(new TopicPartition(topic, 0), 0L)
              .containsEntry(new TopicPartition(topic, 1), 0L);
        })
        .verifyComplete();

    StepVerifier.create(reactiveAdminClient.listOffsetsUnsafe(requestedPartitions, OffsetSpec.latest()))
        .assertNext(offsets -> {
          assertThat(offsets)
              .hasSize(2)
              .containsEntry(new TopicPartition(topic, 0), 0L)
              .containsEntry(new TopicPartition(topic, 1), 2L);
        })
        .verifyComplete();
  }

}
