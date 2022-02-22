package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.BytesSerializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ContextConfiguration;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
public class OffsetsResetServiceTest extends AbstractBaseTest {

  private static final int PARTITIONS = 5;

  private static final KafkaCluster CLUSTER =
      KafkaCluster.builder()
          .name(LOCAL)
          .bootstrapServers(kafka.getBootstrapServers())
          .properties(new Properties())
          .build();

  private final String groupId = "OffsetsResetServiceTestGroup-" + UUID.randomUUID();
  private final String topic = "OffsetsResetServiceTestTopic-" + UUID.randomUUID();

  private OffsetsResetService offsetsResetService;

  @BeforeEach
  void init() {
    AdminClientServiceImpl adminClientService = new AdminClientServiceImpl();
    adminClientService.setClientTimeout(5_000);
    offsetsResetService = new OffsetsResetService(adminClientService);

    createTopic(new NewTopic(topic, PARTITIONS, (short) 1));
    createConsumerGroup();
  }

  @AfterEach
  void cleanUp() {
    deleteTopic(topic);
  }

  private void createConsumerGroup() {
    try (var consumer = groupConsumer()) {
      consumer.subscribe(Pattern.compile("no-such-topic-pattern"));
      consumer.poll(Duration.ofMillis(200));
      consumer.commitSync();
    }
  }

  @Test
  void failsIfGroupDoesNotExists() {
    List<Mono<?>> expectedNotFound = List.of(
        offsetsResetService
            .resetToEarliest(CLUSTER, "non-existing-group", topic, null),
        offsetsResetService
            .resetToLatest(CLUSTER, "non-existing-group", topic, null),
        offsetsResetService
            .resetToTimestamp(CLUSTER, "non-existing-group", topic, null, System.currentTimeMillis()),
        offsetsResetService
            .resetToOffsets(CLUSTER, "non-existing-group", topic, Map.of())
    );

    for (Mono<?> mono : expectedNotFound) {
      StepVerifier.create(mono)
          .expectErrorMatches(t -> t instanceof NotFoundException)
          .verify();
    }
  }

  @Test
  void failsIfGroupIsActive() {
    // starting consumer to activate group
    try (var consumer = groupConsumer()) {

      consumer.subscribe(Pattern.compile("no-such-topic-pattern"));
      consumer.poll(Duration.ofMillis(100));

      List<Mono<?>> expectedValidationError = List.of(
          offsetsResetService.resetToEarliest(CLUSTER, groupId, topic, null),
          offsetsResetService.resetToLatest(CLUSTER, groupId, topic, null),
          offsetsResetService
              .resetToTimestamp(CLUSTER, groupId, topic, null, System.currentTimeMillis()),
          offsetsResetService.resetToOffsets(CLUSTER, groupId, topic, Map.of())
      );

      for (Mono<?> mono : expectedValidationError) {
        StepVerifier.create(mono)
            .expectErrorMatches(t -> t instanceof ValidationException)
            .verify();
      }
    }
  }

  @Test
  void resetToOffsets() {
    sendMsgsToPartition(Map.of(0, 10, 1, 10, 2, 10));

    var expectedOffsets = Map.of(0, 5L, 1, 5L, 2, 5L);
    offsetsResetService.resetToOffsets(CLUSTER, groupId, topic, expectedOffsets).block();
    assertOffsets(expectedOffsets);
  }

  @Test
  void resetToOffsetsCommitsEarliestOrLatestOffsetsIfOffsetsBoundsNotValid() {
    sendMsgsToPartition(Map.of(0, 10, 1, 10, 2, 10));

    var offsetsWithInValidBounds = Map.of(0, -2L, 1, 5L, 2, 500L);
    var expectedOffsets = Map.of(0, 0L, 1, 5L, 2, 10L);
    offsetsResetService.resetToOffsets(CLUSTER, groupId, topic, offsetsWithInValidBounds).block();
    assertOffsets(expectedOffsets);
  }

  @Test
  void resetToEarliest() {
    sendMsgsToPartition(Map.of(0, 10, 1, 10, 2, 10));

    commit(Map.of(0, 5L, 1, 5L, 2, 5L));
    offsetsResetService.resetToEarliest(CLUSTER, groupId, topic, List.of(0, 1)).block();
    assertOffsets(Map.of(0, 0L, 1, 0L, 2, 5L));

    commit(Map.of(0, 5L, 1, 5L, 2, 5L));
    offsetsResetService.resetToEarliest(CLUSTER, groupId, topic, null).block();
    assertOffsets(Map.of(0, 0L, 1, 0L, 2, 0L, 3, 0L, 4, 0L));
  }

  @Test
  void resetToLatest() {
    sendMsgsToPartition(Map.of(0, 10, 1, 10, 2, 10, 3, 10, 4, 10));

    commit(Map.of(0, 5L, 1, 5L, 2, 5L));
    offsetsResetService.resetToLatest(CLUSTER, groupId, topic, List.of(0, 1)).block();
    assertOffsets(Map.of(0, 10L, 1, 10L, 2, 5L));

    commit(Map.of(0, 5L, 1, 5L, 2, 5L));
    offsetsResetService.resetToLatest(CLUSTER, groupId, topic, null).block();
    assertOffsets(Map.of(0, 10L, 1, 10L, 2, 10L, 3, 10L, 4, 10L));
  }

  @Test
  void resetToTimestamp() {
    send(
        Stream.of(
            new ProducerRecord<Bytes, Bytes>(topic, 0, 1000L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 0, 1500L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 0, 2000L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 1, 1000L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 1, 2000L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 2, 1000L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 2, 1100L, null, null),
            new ProducerRecord<Bytes, Bytes>(topic, 2, 1200L, null, null)));

    offsetsResetService.resetToTimestamp(
        CLUSTER, groupId, topic, List.of(0, 1, 2, 3), 1600L
    ).block();
    assertOffsets(Map.of(0, 2L, 1, 1L, 2, 3L, 3, 0L));
  }


  private void commit(Map<Integer, Long> offsetsToCommit) {
    try (var consumer = groupConsumer()) {
      consumer.commitSync(
          offsetsToCommit.entrySet().stream()
              .collect(Collectors.toMap(
                  e -> new TopicPartition(topic, e.getKey()),
                  e -> new OffsetAndMetadata(e.getValue())))
      );
    }
  }

  private void sendMsgsToPartition(Map<Integer, Integer> msgsCountForPartitions) {
    Bytes bytes = new Bytes("noMatter".getBytes());
    send(
        msgsCountForPartitions.entrySet().stream()
            .flatMap(e ->
                IntStream.range(0, e.getValue())
                    .mapToObj(i -> new ProducerRecord<>(topic, e.getKey(), bytes, bytes))));
  }

  private void send(Stream<ProducerRecord<Bytes, Bytes>> toSend) {
    var properties = new Properties();
    properties.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    var serializer = new BytesSerializer();
    try (var producer = new KafkaProducer<>(properties, serializer, serializer)) {
      toSend.forEach(producer::send);
      producer.flush();
    }
  }

  private void assertOffsets(Map<Integer, Long> expectedOffsets) {
    try (var consumer = groupConsumer()) {
      var tps = expectedOffsets.keySet().stream()
          .map(idx -> new TopicPartition(topic, idx))
          .collect(Collectors.toSet());

      var actualOffsets = consumer.committed(tps).entrySet().stream()
          .collect(Collectors.toMap(e -> e.getKey().partition(), e -> e.getValue().offset()));

      assertThat(actualOffsets).isEqualTo(expectedOffsets);
    }
  }

  private Consumer<?, ?> groupConsumer() {
    Properties props = new Properties();
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui-" + UUID.randomUUID());
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, CLUSTER.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
    return new KafkaConsumer<>(props);
  }

}
