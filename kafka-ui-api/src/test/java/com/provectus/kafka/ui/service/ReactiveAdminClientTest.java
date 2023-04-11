package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.toMonoWithExceptionFilter;
import static java.util.Objects.requireNonNull;
import static org.apache.kafka.clients.admin.ListOffsetsResult.ListOffsetsResultInfo;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.ThrowableAssert.ThrowingCallable;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AlterConfigOp;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.TopicPartitionInfo;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.internals.KafkaFutureImpl;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.assertj.core.api.ThrowableAssert;
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

  void fillTopic(String topic, int msgsCnt) {
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int i = 0; i < msgsCnt; i++) {
        producer.send(topic, UUID.randomUUID().toString());
      }
    }
  }

  @Test
  void testToMonoWithExceptionFilter() {
    var failedFuture = new KafkaFutureImpl<String>();
    failedFuture.completeExceptionally(new UnknownTopicOrPartitionException());

    var okFuture = new KafkaFutureImpl<String>();
    okFuture.complete("done");

    var emptyFuture = new KafkaFutureImpl<String>();
    emptyFuture.complete(null);

    Map<String, KafkaFuture<String>> arg = Map.of(
        "failure", failedFuture,
        "ok", okFuture,
        "empty", emptyFuture
    );
    StepVerifier.create(toMonoWithExceptionFilter(arg, UnknownTopicOrPartitionException.class))
        .assertNext(result -> assertThat(result).hasSize(1).containsEntry("ok", "done"))
        .verifyComplete();
  }

  @Test
  void filterPartitionsWithLeaderCheckSkipsPartitionsFromTopicWhereSomePartitionsHaveNoLeader() {
    var filteredPartitions = ReactiveAdminClient.filterPartitionsWithLeaderCheck(
        List.of(
            // contains partitions with no leader
            new TopicDescription("noLeaderTopic", false,
                List.of(
                    new TopicPartitionInfo(0, new Node(1, "n1", 9092), List.of(), List.of()),
                    new TopicPartitionInfo(1, null, List.of(), List.of()))),
            // should be skipped by predicate
            new TopicDescription("skippingByPredicate", false,
                List.of(
                    new TopicPartitionInfo(0, new Node(1, "n1", 9092), List.of(), List.of()))),
            // good topic
            new TopicDescription("good", false,
                List.of(
                    new TopicPartitionInfo(0, new Node(1, "n1", 9092), List.of(), List.of()),
                    new TopicPartitionInfo(1, new Node(2, "n2", 9092), List.of(), List.of()))
            )),
        p -> !p.topic().equals("skippingByPredicate"),
        false
    );

    assertThat(filteredPartitions)
        .containsExactlyInAnyOrder(
            new TopicPartition("good", 0),
            new TopicPartition("good", 1)
        );
  }

  @Test
  void filterPartitionsWithLeaderCheckThrowExceptionIfThereIsSomePartitionsWithoutLeaderAndFlagSet() {
    ThrowingCallable call = () -> ReactiveAdminClient.filterPartitionsWithLeaderCheck(
        List.of(
            // contains partitions with no leader
            new TopicDescription("t1", false,
                List.of(
                    new TopicPartitionInfo(0, new Node(1, "n1", 9092), List.of(), List.of()),
                    new TopicPartitionInfo(1, null, List.of(), List.of()))),
            new TopicDescription("t2", false,
                List.of(
                    new TopicPartitionInfo(0, new Node(1, "n1", 9092), List.of(), List.of()))
            )),
        p -> true,
        // setting failOnNoLeader flag
        true
    );
    assertThatThrownBy(call).isInstanceOf(ValidationException.class);
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


  @Test
  void testListConsumerGroupOffsets() throws Exception {
    String topic = UUID.randomUUID().toString();
    String anotherTopic = UUID.randomUUID().toString();
    createTopics(new NewTopic(topic, 2, (short) 1), new NewTopic(anotherTopic, 1, (short) 1));
    fillTopic(topic, 10);

    Function<String, KafkaConsumer<String, String>> consumerSupplier = groupName -> {
      Properties p = new Properties();
      p.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
      p.setProperty(ConsumerConfig.GROUP_ID_CONFIG, groupName);
      p.setProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
      p.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
      p.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
      p.setProperty(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
      return new KafkaConsumer<String, String>(p);
    };

    String fullyPolledConsumer = UUID.randomUUID().toString();
    try (KafkaConsumer<String, String> c = consumerSupplier.apply(fullyPolledConsumer)) {
      c.subscribe(List.of(topic));
      int polled = 0;
      while (polled < 10) {
        polled += c.poll(Duration.ofMillis(50)).count();
      }
      c.commitSync();
    }

    String polled1MsgConsumer = UUID.randomUUID().toString();
    try (KafkaConsumer<String, String> c = consumerSupplier.apply(polled1MsgConsumer)) {
      c.subscribe(List.of(topic));
      c.poll(Duration.ofMillis(100));
      c.commitSync(Map.of(tp(topic, 0), new OffsetAndMetadata(1)));
    }

    String noCommitConsumer = UUID.randomUUID().toString();
    try (KafkaConsumer<String, String> c = consumerSupplier.apply(noCommitConsumer)) {
      c.subscribe(List.of(topic));
      c.poll(Duration.ofMillis(100));
    }

    Map<TopicPartition, ListOffsetsResultInfo> endOffsets = adminClient.listOffsets(Map.of(
        tp(topic, 0), OffsetSpec.latest(),
        tp(topic, 1), OffsetSpec.latest())).all().get();

    StepVerifier.create(
            reactiveAdminClient.listConsumerGroupOffsets(
                List.of(fullyPolledConsumer, polled1MsgConsumer, noCommitConsumer),
                List.of(
                    tp(topic, 0),
                    tp(topic, 1),
                    tp(anotherTopic, 0))
            )
        ).assertNext(table -> {

          assertThat(table.row(polled1MsgConsumer))
              .containsEntry(tp(topic, 0), 1L)
              .hasSize(1);

          assertThat(table.row(noCommitConsumer))
              .isEmpty();

          assertThat(table.row(fullyPolledConsumer))
              .containsEntry(tp(topic, 0), endOffsets.get(tp(topic, 0)).offset())
              .containsEntry(tp(topic, 1), endOffsets.get(tp(topic, 1)).offset())
              .hasSize(2);
        })
        .verifyComplete();
  }

  private static TopicPartition tp(String topic, int partition) {
    return new TopicPartition(topic, partition);
  }

}
