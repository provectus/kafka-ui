package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.model.SeekTypeDTO.BEGINNING;
import static com.provectus.kafka.ui.model.SeekTypeDTO.LATEST;
import static com.provectus.kafka.ui.model.SeekTypeDTO.OFFSET;
import static com.provectus.kafka.ui.model.SeekTypeDTO.TIMESTAMP;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.test.StepVerifier;

@Slf4j
class RecordEmitterTest extends AbstractIntegrationTest {

  static final int PARTITIONS = 5;
  static final int MSGS_PER_PARTITION = 100;

  static final String TOPIC = RecordEmitterTest.class.getSimpleName() + "_" + UUID.randomUUID();
  static final String EMPTY_TOPIC = TOPIC + "_empty";
  static final List<Record> SENT_RECORDS = new ArrayList<>();
  static final ConsumerRecordDeserializer RECORD_DESERIALIZER = createRecordsDeserializer();

  @BeforeAll
  static void generateMsgs() throws Exception {
    createTopic(new NewTopic(TOPIC, PARTITIONS, (short) 1));
    createTopic(new NewTopic(EMPTY_TOPIC, PARTITIONS, (short) 1));
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int partition = 0; partition < PARTITIONS; partition++) {
        for (int i = 0; i < MSGS_PER_PARTITION; i++) {
          long ts = System.currentTimeMillis() + i;
          var value = "msg_" + partition + "_" + i;
          var metadata = producer.send(
              new ProducerRecord<>(
                  TOPIC, partition, ts, null, value, List.of(
                      new RecordHeader("name", null),
                      new RecordHeader("name2", "value".getBytes())
                  )
              )
          ).get();
          SENT_RECORDS.add(
              new Record(
                  value,
                  new TopicPartition(metadata.topic(), metadata.partition()),
                  metadata.offset(),
                  ts
              )
          );
        }
      }
    }
  }

  @AfterAll
  static void cleanup() {
    deleteTopic(TOPIC);
    deleteTopic(EMPTY_TOPIC);
  }

  private static ConsumerRecordDeserializer createRecordsDeserializer() {
    Serde s = new StringSerde();
    s.configure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
    return new ConsumerRecordDeserializer(
        StringSerde.name(),
        s.deserializer(null, Serde.Target.KEY),
        StringSerde.name(),
        s.deserializer(null, Serde.Target.VALUE),
        StringSerde.name(),
        s.deserializer(null, Serde.Target.KEY),
        s.deserializer(null, Serde.Target.VALUE)
    );
  }

  @Test
  void pollNothingOnEmptyTopic() {
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(BEGINNING, EMPTY_TOPIC, null),
        RECORD_DESERIALIZER
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(BEGINNING, EMPTY_TOPIC, null),
        100,
        RECORD_DESERIALIZER
    );

    StepVerifier.create(Flux.create(forwardEmitter))
        .expectNextMatches(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.PHASE))
        .expectNextMatches(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.DONE))
        .expectComplete()
        .verify();

    StepVerifier.create(Flux.create(backwardEmitter))
        .expectNextMatches(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.PHASE))
        .expectNextMatches(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.DONE))
        .expectComplete()
        .verify();
  }

  @Test
  void pollFullTopicFromBeginning() {
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(BEGINNING, TOPIC, null),
        RECORD_DESERIALIZER
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(LATEST, TOPIC, null),
        PARTITIONS * MSGS_PER_PARTITION,
        RECORD_DESERIALIZER
    );

    List<String> expectedValues = SENT_RECORDS.stream().map(Record::getValue).collect(Collectors.toList());

    expectEmitter(forwardEmitter, expectedValues);
    expectEmitter(backwardEmitter, expectedValues);
  }

  @Test
  void pollWithOffsets() {
    Map<TopicPartition, Long> targetOffsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      long offset = ThreadLocalRandom.current().nextLong(MSGS_PER_PARTITION);
      targetOffsets.put(new TopicPartition(TOPIC, i), offset);
    }

    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(OFFSET, TOPIC, targetOffsets),
        RECORD_DESERIALIZER
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(OFFSET, TOPIC, targetOffsets),
        PARTITIONS * MSGS_PER_PARTITION,
        RECORD_DESERIALIZER
    );

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() >= targetOffsets.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    expectEmitter(forwardEmitter, expectedValues);

    expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() < targetOffsets.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    expectEmitter(backwardEmitter, expectedValues);
  }

  @Test
  void pollWithTimestamps() {
    Map<TopicPartition, Long> targetTimestamps = new HashMap<>();
    final Map<TopicPartition, List<Record>> perPartition =
        SENT_RECORDS.stream().collect(Collectors.groupingBy((r) -> r.tp));
    for (int i = 0; i < PARTITIONS; i++) {
      final List<Record> records = perPartition.get(new TopicPartition(TOPIC, i));
      int randRecordIdx = ThreadLocalRandom.current().nextInt(records.size());
      log.info("partition: {} position: {}", i, randRecordIdx);
      targetTimestamps.put(
          new TopicPartition(TOPIC, i),
          records.get(randRecordIdx).getTimestamp()
      );
    }

    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(TIMESTAMP, TOPIC, targetTimestamps),
        RECORD_DESERIALIZER
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(TIMESTAMP, TOPIC, targetTimestamps),
        PARTITIONS * MSGS_PER_PARTITION,
        RECORD_DESERIALIZER
    );

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getTimestamp() >= targetTimestamps.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    expectEmitter(forwardEmitter, expectedValues);

    expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getTimestamp() < targetTimestamps.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    expectEmitter(backwardEmitter, expectedValues);
  }

  @Test
  void backwardEmitterSeekToEnd() {
    final int numMessages = 100;
    final Map<TopicPartition, Long> targetOffsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      targetOffsets.put(new TopicPartition(TOPIC, i), (long) MSGS_PER_PARTITION);
    }

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(OFFSET, TOPIC, targetOffsets),
        numMessages,
        RECORD_DESERIALIZER
    );

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() < targetOffsets.get(r.getTp()))
        .filter(r -> r.getOffset() >= (targetOffsets.get(r.getTp()) - (numMessages / PARTITIONS)))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(expectedValues).size().isEqualTo(numMessages);

    expectEmitter(backwardEmitter, expectedValues);
  }

  @Test
  void backwardEmitterSeekToBegin() {
    Map<TopicPartition, Long> offsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      offsets.put(new TopicPartition(TOPIC, i), 0L);
    }

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new ConsumerPosition(OFFSET, TOPIC, offsets),
        100,
        RECORD_DESERIALIZER
    );

    expectEmitter(backwardEmitter,
        100,
        e -> e.expectNextCount(0),
        StepVerifier.Assertions::hasNotDroppedElements
    );
  }

  private void expectEmitter(Consumer<FluxSink<TopicMessageEventDTO>> emitter, List<String> expectedValues) {
    expectEmitter(emitter,
        expectedValues.size(),
        e -> e.recordWith(ArrayList::new)
            .expectNextCount(expectedValues.size())
            .expectRecordedMatches(r -> r.containsAll(expectedValues))
            .consumeRecordedWith(r -> log.info("Collected collection: {}", r)),
        v -> {
        }
    );
  }

  private void expectEmitter(
      Consumer<FluxSink<TopicMessageEventDTO>> emitter,
      int take,
      Function<StepVerifier.Step<String>, StepVerifier.Step<String>> stepConsumer,
      Consumer<StepVerifier.Assertions> assertionsConsumer) {

    StepVerifier.FirstStep<String> firstStep = StepVerifier.create(
        Flux.create(emitter)
            .filter(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE))
            .take(take)
            .map(m -> m.getMessage().getContent())
    );

    StepVerifier.Step<String> step = stepConsumer.apply(firstStep);
    assertionsConsumer.accept(step.expectComplete().verifyThenAssertThat());
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer() {
    return createConsumer(Map.of());
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer(Map<String, Object> properties) {
    final Map<String, ? extends Serializable> map = Map.of(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
        ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString(),
        ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 19, // to check multiple polls
        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class,
        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class
    );
    Properties props = new Properties();
    props.putAll(map);
    props.putAll(properties);
    return new KafkaConsumer<>(props);
  }

  @Value
  static class Record {
    String value;
    TopicPartition tp;
    long offset;
    long timestamp;
  }
}
