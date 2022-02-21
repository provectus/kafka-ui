package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.model.SeekDirectionDTO.BACKWARD;
import static com.provectus.kafka.ui.model.SeekDirectionDTO.FORWARD;
import static com.provectus.kafka.ui.model.SeekTypeDTO.BEGINNING;
import static com.provectus.kafka.ui.model.SeekTypeDTO.OFFSET;
import static com.provectus.kafka.ui.model.SeekTypeDTO.TIMESTAMP;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serde.SimpleRecordSerDe;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import com.provectus.kafka.ui.util.OffsetsSeekForward;
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
import org.springframework.test.context.ContextConfiguration;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.test.StepVerifier;

@Slf4j
@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class RecordEmitterTest extends AbstractBaseTest {

  static final int PARTITIONS = 5;
  static final int MSGS_PER_PARTITION = 100;

  static final String TOPIC = RecordEmitterTest.class.getSimpleName() + "_" + UUID.randomUUID();
  static final String EMPTY_TOPIC = TOPIC + "_empty";
  static final List<Record> SENT_RECORDS = new ArrayList<>();

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

  @Test
  void pollNothingOnEmptyTopic() {
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(EMPTY_TOPIC,
            new ConsumerPosition(BEGINNING, Map.of(), FORWARD)
        ), new SimpleRecordSerDe()
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(
            EMPTY_TOPIC,
            new ConsumerPosition(BEGINNING, Map.of(), BACKWARD),
            100
        ), new SimpleRecordSerDe()
    );

    StepVerifier.create(
        Flux.create(forwardEmitter)
            .filter(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE))
            .take(100)
    ).expectNextCount(0).expectComplete().verify();

    StepVerifier.create(
        Flux.create(backwardEmitter)
            .filter(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE))
            .take(100)
    ).expectNextCount(0).expectComplete().verify();
  }

  @Test
  void pollFullTopicFromBeginning() {
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(BEGINNING, Map.of(), FORWARD)
        ), new SimpleRecordSerDe()
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(BEGINNING, Map.of(), FORWARD),
            PARTITIONS * MSGS_PER_PARTITION
        ), new SimpleRecordSerDe()
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
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(OFFSET, targetOffsets, FORWARD)
        ), new SimpleRecordSerDe()
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(OFFSET, targetOffsets, BACKWARD),
            PARTITIONS * MSGS_PER_PARTITION
        ), new SimpleRecordSerDe()
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
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(TIMESTAMP, targetTimestamps, FORWARD)
        ), new SimpleRecordSerDe()
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(TIMESTAMP, targetTimestamps, BACKWARD),
            PARTITIONS * MSGS_PER_PARTITION
        ), new SimpleRecordSerDe()
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
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(OFFSET, targetOffsets, BACKWARD),
            numMessages
        ), new SimpleRecordSerDe()
    );

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() < targetOffsets.get(r.getTp()))
        .filter(r -> r.getOffset() >= (targetOffsets.get(r.getTp()) - (100 / PARTITIONS)))
        .map(Record::getValue)
        .collect(Collectors.toList());

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
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(OFFSET, offsets, BACKWARD),
            100
        ), new SimpleRecordSerDe()
    );

    expectEmitter(backwardEmitter,
        e -> e.expectNextCount(0),
        StepVerifier.Assertions::hasNotDroppedElements
    );
  }

  private void expectEmitter(Consumer<FluxSink<TopicMessageEventDTO>> emitter, List<String> expectedValues) {
    expectEmitter(emitter,
        e -> e.expectNextCount(expectedValues.size()),
        v -> v.hasDroppedExactly(expectedValues)
    );
  }

  private void expectEmitter(
      Consumer<FluxSink<TopicMessageEventDTO>> emitter,
      Function<StepVerifier.Step<String>, StepVerifier.Step<String>> stepConsumer,
      Consumer<StepVerifier.Assertions> assertionsConsumer) {

    StepVerifier.FirstStep<String> firstStep = StepVerifier.create(
        Flux.create(emitter)
            .filter(m -> m.getType().equals(TopicMessageEventDTO.TypeEnum.MESSAGE))
            .take(Long.MAX_VALUE)
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
        ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 20, // to check multiple polls
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
